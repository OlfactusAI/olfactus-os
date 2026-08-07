import type {
  GlobalFragranceRecord,
} from "@/lib/database/schema";
import type {
  ImportFieldConflict,
  ImportMatchBatchResult,
  ImportMatchCandidate,
  ImportRecordMatch,
  NormalizedFragranceImport,
} from "@/lib/database/import/types";
import {
  normalizeCanonicalId,
  normalizeEntityLabel,
} from "@/lib/database/import/normalization";

const weights = {
  name: 30,
  brand: 20,
  concentration: 14,
  releaseYear: 8,
  perfumer: 8,
  notes: 8,
  accords: 7,
  alias: 5,
} as const;

export function analyzeImportMatches({
  incoming,
  existing,
}: {
  incoming: NormalizedFragranceImport[];
  existing: GlobalFragranceRecord[];
}): ImportMatchBatchResult {
  const matches =
    incoming.map((record) =>
      analyzeImportRecord({
        incoming: record,
        existing,
      }),
    );

  return {
    modelVersion: "GDM-2.0.0",
    generatedAt:
      new Date().toISOString(),
    recordsAnalyzed:
      matches.length,
    newCount:
      countClassification(
        matches,
        "new",
      ),
    exactDuplicateCount:
      countClassification(
        matches,
        "exact-duplicate",
      ),
    probableDuplicateCount:
      countClassification(
        matches,
        "probable-duplicate",
      ),
    possibleVariantCount:
      countClassification(
        matches,
        "possible-variant",
      ),
    safeUpdateCount:
      countClassification(
        matches,
        "safe-update",
      ),
    conflictingUpdateCount:
      countClassification(
        matches,
        "conflicting-update",
      ),
    manualReviewCount:
      countClassification(
        matches,
        "manual-review",
      ),
    matches,
  };
}

export function analyzeImportRecord({
  incoming,
  existing,
}: {
  incoming: NormalizedFragranceImport;
  existing: GlobalFragranceRecord[];
}): ImportRecordMatch {
  const candidates =
    existing
      .map((fragrance) =>
        scoreCandidate({
          incoming,
          existing: fragrance,
        }),
      )
      .filter(
        (candidate) =>
          candidate.score >= 30,
      )
      .sort(
        (a, b) =>
          b.score - a.score,
      )
      .slice(0, 5);

  const best =
    candidates[0];

  if (!best) {
    return {
      sourceRow:
        incoming.sourceRow,
      incomingId:
        incoming.id,
      classification: "new",
      recommendedAction:
        "create",
      confidence: 98,
      candidates: [],
      conflicts: [],
      explanation:
        "No sufficiently similar existing fragrance was found.",
    };
  }

  const existingRecord =
    existing.find(
      (fragrance) =>
        fragrance.id ===
        best.existingFragranceId,
    );

  if (!existingRecord) {
    return {
      sourceRow:
        incoming.sourceRow,
      incomingId:
        incoming.id,
      classification:
        "manual-review",
      recommendedAction:
        "review",
      confidence: 50,
      candidates,
      conflicts: [],
      explanation:
        "A match candidate was scored but could not be resolved.",
    };
  }

  const conflicts =
    compareFields({
      incoming,
      existing:
        existingRecord,
    });

  const conflictCount =
    conflicts.filter(
      (conflict) =>
        conflict.status ===
        "conflict",
    ).length;
  const addedDataCount =
    conflicts.filter(
      (conflict) =>
        conflict.status ===
        "incoming-adds-data",
    ).length;

  const explicitIdMatch =
    incoming.id ===
    existingRecord.id;

  const canonicalIdentityMatch =
    normalizeCanonicalId(
      incoming.brand,
      baseFragranceName(
        incoming.name,
      ),
      canonicalConcentration(
        incoming.concentration,
      ),
    ) ===
    normalizeCanonicalId(
      existingRecord.brand,
      baseFragranceName(
        existingRecord.name,
      ),
      canonicalConcentration(
        existingRecord.concentration,
      ),
    );

  const materialConflicts =
    conflicts.filter(
      (conflict) =>
        conflict.status ===
          "conflict" &&
        [
          "brand",
          "concentration",
          "releaseYear",
          "family",
        ].includes(
          conflict.field,
        ),
    );

  if (
    explicitIdMatch &&
    materialConflicts.length > 0
  ) {
    return createResult({
      incoming,
      candidates,
      conflicts,
      classification:
        "conflicting-update",
      action: "review",
      confidence:
        Math.max(
          96,
          best.score,
        ),
      matchedFragranceId:
        existingRecord.id,
      explanation:
        "The explicit record ID matches, but one or more identity-level fields conflict.",
    });
  }

  if (
    explicitIdMatch &&
    materialConflicts.length === 0 &&
    addedDataCount === 0
  ) {
    return createResult({
      incoming,
      candidates,
      conflicts,
      classification:
        "exact-duplicate",
      action: "skip",
      confidence:
        Math.max(98, best.score),
      matchedFragranceId:
        existingRecord.id,
      explanation:
        "The explicit record ID and available fields match the existing record.",
    });
  }

  if (
    explicitIdMatch &&
    materialConflicts.length === 0 &&
    addedDataCount > 0
  ) {
    return createResult({
      incoming,
      candidates,
      conflicts,
      classification:
        "safe-update",
      action: "update",
      confidence:
        Math.max(94, best.score),
      matchedFragranceId:
        existingRecord.id,
      explanation:
        "The explicit record ID matches and the incoming record adds non-conflicting data.",
    });
  }

  if (
    canonicalIdentityMatch &&
    materialConflicts.length === 0
  ) {
    return createResult({
      incoming,
      candidates,
      conflicts,
      classification:
        addedDataCount > 0
          ? "safe-update"
          : "probable-duplicate",
      action:
        addedDataCount > 0
          ? "update"
          : "merge",
      confidence:
        Math.max(
          92,
          best.score,
        ),
      matchedFragranceId:
        existingRecord.id,
      explanation:
        "Normalized brand, fragrance-line name, concentration, and release identity indicate the same fragrance.",
    });
  }

  const lineNameScore =
    stringSimilarity(
      baseFragranceName(
        incoming.name,
      ),
      baseFragranceName(
        existingRecord.name,
      ),
    );

  if (
    best.brandScore === 100 &&
    lineNameScore >= 85 &&
    best.concentrationScore < 65
  ) {
    return createResult({
      incoming,
      candidates,
      conflicts,
      classification:
        "possible-variant",
      action: "review",
      confidence:
        Math.max(
          76,
          best.score,
        ),
      matchedFragranceId:
        existingRecord.id,
      explanation:
        "The brand and base fragrance-line name match, while concentration or release details indicate a distinct variant.",
    });
  }

  if (
    best.score >= 82 &&
    materialConflicts.length > 0
  ) {
    return createResult({
      incoming,
      candidates,
      conflicts,
      classification:
        "conflicting-update",
      action: "review",
      confidence:
        best.score,
      matchedFragranceId:
        existingRecord.id,
      explanation:
        "The records likely refer to the same fragrance, but one or more identity-level fields conflict.",
    });
  }

  if (
    best.score >= 78 &&
    best.brandScore === 100 &&
    best.concentrationScore >= 95 &&
    best.releaseYearScore >= 65
  ) {
    return createResult({
      incoming,
      candidates,
      conflicts,
      classification:
        addedDataCount > 0
          ? "safe-update"
          : "probable-duplicate",
      action:
        addedDataCount > 0
          ? "update"
          : "merge",
      confidence:
        Math.max(
          88,
          best.score,
        ),
      matchedFragranceId:
        existingRecord.id,
      explanation:
        "Brand, concentration, release timing, and normalized fragrance-line name indicate the same release.",
    });
  }

  if (best.score >= 68) {
    return createResult({
      incoming,
      candidates,
      conflicts,
      classification:
        "manual-review",
      action: "review",
      confidence:
        best.score,
      matchedFragranceId:
        existingRecord.id,
      explanation:
        "The record is similar enough to require review but not similar enough for an automatic merge.",
    });
  }

  return {
    sourceRow:
      incoming.sourceRow,
    incomingId:
      incoming.id,
    classification: "new",
    recommendedAction:
      "create",
    confidence:
      Math.max(
        70,
        100 - best.score,
      ),
    candidates,
    conflicts: [],
    explanation:
      "The strongest candidate is not similar enough to block creation.",
  };
}

function scoreCandidate({
  incoming,
  existing,
}: {
  incoming: NormalizedFragranceImport;
  existing: GlobalFragranceRecord;
}): ImportMatchCandidate {
  const nameScore =
    stringSimilarity(
      incoming.name,
      existing.name,
    );
  const brandScore =
    stringSimilarity(
      incoming.brand,
      existing.brand,
    );
  const concentrationScore =
    concentrationSimilarity(
      incoming.concentration,
      existing.concentration,
    );
  const releaseYearScore =
    yearSimilarity(
      incoming.releaseYear,
      existing.releaseYear,
    );
  const perfumerScore =
    setSimilarity(
      incoming.perfumers,
      existing.perfumers ??
        [],
    );
  const notesScore =
    setSimilarity(
      [
        ...incoming.topNotes,
        ...incoming.heartNotes,
        ...incoming.baseNotes,
      ],
      [
        ...(existing.notes
          ?.top ?? []),
        ...(existing.notes
          ?.heart ?? []),
        ...(existing.notes
          ?.base ?? []),
      ],
    );
  const accordsScore =
    setSimilarity(
      incoming.accords,
      existing.accords ?? [],
    );
  const aliasScore =
    aliasSimilarity(
      incoming,
      existing,
    );

  const score =
    Math.round(
      (nameScore *
        weights.name +
        brandScore *
          weights.brand +
        concentrationScore *
          weights.concentration +
        releaseYearScore *
          weights.releaseYear +
        perfumerScore *
          weights.perfumer +
        notesScore *
          weights.notes +
        accordsScore *
          weights.accords +
        aliasScore *
          weights.alias) /
        100,
    );

  return {
    existingFragranceId:
      existing.id,
    score,
    nameScore,
    brandScore,
    concentrationScore,
    releaseYearScore,
    perfumerScore,
    notesScore,
    accordsScore,
    aliasScore,
  };
}

function compareFields({
  incoming,
  existing,
}: {
  incoming: NormalizedFragranceImport;
  existing: GlobalFragranceRecord;
}): ImportFieldConflict[] {
  return [
    compareScalar(
      "name",
      existing.name,
      incoming.name,
    ),
    compareScalar(
      "brand",
      existing.brand,
      incoming.brand,
    ),
    compareScalar(
      "concentration",
      existing.concentration,
      incoming.concentration,
    ),
    compareScalar(
      "releaseYear",
      existing.releaseYear,
      incoming.releaseYear,
    ),
    compareScalar(
      "family",
      existing.family,
      incoming.family,
    ),
    compareList(
      "perfumers",
      existing.perfumers ??
        [],
      incoming.perfumers,
    ),
    compareList(
      "topNotes",
      existing.notes?.top ??
        [],
      incoming.topNotes,
    ),
    compareList(
      "heartNotes",
      existing.notes?.heart ??
        [],
      incoming.heartNotes,
    ),
    compareList(
      "baseNotes",
      existing.notes?.base ??
        [],
      incoming.baseNotes,
    ),
    compareList(
      "accords",
      existing.accords ?? [],
      incoming.accords,
    ),
    compareScalar(
      "availability",
      existing.availability,
      incoming.availability,
    ),
  ];
}

function compareScalar(
  field:
    ImportFieldConflict["field"],
  existingValue: unknown,
  incomingValue: unknown,
): ImportFieldConflict {
  const existingMissing =
    isMissingImportValue(
      existingValue,
    );
  const incomingMissing =
    isMissingImportValue(
      incomingValue,
    );

  if (
    existingMissing &&
    incomingMissing
  ) {
    return conflictResult({
      field,
      existingValue,
      incomingValue,
      status: "same",
      confidence: 100,
      recommendation:
        "keep-existing",
    });
  }

  if (
    existingMissing &&
    !incomingMissing
  ) {
    return conflictResult({
      field,
      existingValue,
      incomingValue,
      status:
        "incoming-adds-data",
      confidence: 95,
      recommendation:
        "use-incoming",
    });
  }

  if (
    !existingMissing &&
    incomingMissing
  ) {
    return conflictResult({
      field,
      existingValue,
      incomingValue,
      status:
        "existing-more-complete",
      confidence: 95,
      recommendation:
        "keep-existing",
    });
  }

  const same =
    field === "concentration"
      ? concentrationSimilarity(
          String(existingValue),
          String(incomingValue),
        ) >= 95
      : normalizeComparable(
          existingValue,
        ) ===
        normalizeComparable(
          incomingValue,
        );

  return conflictResult({
    field,
    existingValue,
    incomingValue,
    status:
      same
        ? "same"
        : "conflict",
    confidence:
      same ? 100 : 75,
    recommendation:
      same
        ? "keep-existing"
        : "review",
  });
}

function compareList(
  field:
    ImportFieldConflict["field"],
  existingValue: string[],
  incomingValue: string[],
): ImportFieldConflict {
  if (
    !existingValue.length &&
    !incomingValue.length
  ) {
    return conflictResult({
      field,
      existingValue,
      incomingValue,
      status: "same",
      confidence: 100,
      recommendation:
        "keep-existing",
    });
  }

  if (
    !existingValue.length &&
    incomingValue.length
  ) {
    return conflictResult({
      field,
      existingValue,
      incomingValue,
      status:
        "incoming-adds-data",
      confidence: 95,
      recommendation:
        "use-incoming",
    });
  }

  if (
    existingValue.length &&
    !incomingValue.length
  ) {
    return conflictResult({
      field,
      existingValue,
      incomingValue,
      status:
        "existing-more-complete",
      confidence: 95,
      recommendation:
        "keep-existing",
    });
  }

  const similarity =
    setSimilarity(
      existingValue,
      incomingValue,
    );

  if (similarity === 100) {
    return conflictResult({
      field,
      existingValue,
      incomingValue,
      status: "same",
      confidence: 100,
      recommendation:
        "keep-existing",
    });
  }

  if (similarity >= 50) {
    return conflictResult({
      field,
      existingValue,
      incomingValue,
      status:
        "incoming-adds-data",
      confidence: similarity,
      recommendation:
        "merge-values",
    });
  }

  return conflictResult({
    field,
    existingValue,
    incomingValue,
    status: "conflict",
    confidence:
      100 - similarity,
    recommendation: "review",
  });
}

function conflictResult({
  field,
  existingValue,
  incomingValue,
  status,
  confidence,
  recommendation,
}: ImportFieldConflict) {
  return {
    field,
    existingValue,
    incomingValue,
    status,
    confidence,
    recommendation,
  };
}

function createResult({
  incoming,
  candidates,
  conflicts,
  classification,
  action,
  confidence,
  matchedFragranceId,
  explanation,
}: {
  incoming: NormalizedFragranceImport;
  candidates:
    ImportMatchCandidate[];
  conflicts:
    ImportFieldConflict[];
  classification:
    ImportRecordMatch["classification"];
  action:
    ImportRecordMatch["recommendedAction"];
  confidence: number;
  matchedFragranceId:
    string;
  explanation: string;
}): ImportRecordMatch {
  return {
    sourceRow:
      incoming.sourceRow,
    incomingId:
      incoming.id,
    classification,
    recommendedAction:
      action,
    confidence:
      clamp(confidence),
    matchedFragranceId,
    candidates,
    conflicts,
    explanation,
  };
}

function stringSimilarity(
  first: string,
  second: string,
) {
  const a =
    tokenize(first);
  const b =
    tokenize(second);

  if (
    a.join(" ") ===
    b.join(" ")
  ) {
    return 100;
  }

  const intersection =
    a.filter(
      (token) =>
        b.includes(token),
    ).length;
  const union =
    new Set([...a, ...b])
      .size;

  return union
    ? Math.round(
        (intersection /
          union) *
          100,
      )
    : 0;
}

function concentrationSimilarity(
  first: string,
  second: string,
) {
  const a =
    normalizeComparable(first);
  const b =
    normalizeComparable(second);

  if (a === b) return 100;

  const groups = [
    [
      "eau de parfum",
      "edp",
    ],
    [
      "eau de toilette",
      "edt",
    ],
    [
      "eau de cologne",
      "edc",
      "cologne",
    ],
    [
      "parfum",
      "pure parfum",
    ],
    [
      "extrait",
      "extrait de parfum",
    ],
  ];

  if (
    groups.some(
      (group) =>
        group.includes(a) &&
        group.includes(b),
    )
  ) {
    return 100;
  }

  return stringSimilarity(
    a,
    b,
  );
}

function yearSimilarity(
  first?: number,
  second?: number,
) {
  if (
    first === undefined ||
    second === undefined
  ) {
    return 50;
  }

  const difference =
    Math.abs(
      first - second,
    );

  if (difference === 0) {
    return 100;
  }
  if (difference === 1) {
    return 65;
  }
  if (difference <= 3) {
    return 30;
  }
  return 0;
}

function setSimilarity(
  first: string[],
  second: string[],
) {
  if (
    !first.length &&
    !second.length
  ) {
    return 50;
  }
  if (
    !first.length ||
    !second.length
  ) {
    return 35;
  }

  const firstSet =
    new Set(
      first.map(
        normalizeComparable,
      ),
    );
  const secondSet =
    new Set(
      second.map(
        normalizeComparable,
      ),
    );

  const intersection =
    [...firstSet].filter(
      (value) =>
        secondSet.has(value),
    ).length;
  const union =
    new Set([
      ...firstSet,
      ...secondSet,
    ]).size;

  return Math.round(
    (intersection / union) *
      100,
  );
}

function aliasSimilarity(
  incoming:
    NormalizedFragranceImport,
  existing:
    GlobalFragranceRecord,
) {
  const candidates = [
    incoming.name,
    ...incoming.aliases,
  ];

  const existingNames = [
    existing.name,
    existing.canonicalSlug,
  ];

  return Math.max(
    ...candidates.flatMap(
      (candidate) =>
        existingNames.map(
          (name) =>
            stringSimilarity(
              candidate,
              name,
            ),
        ),
    ),
    0,
  );
}

function tokenize(
  value: string,
) {
  return normalizeEntityLabel(
    expandConcentrationAliases(
      value,
    ),
  )
    .toLowerCase()
    .replace(
      /\b(eau|de|the|for)\b/g,
      " ",
    )
    .replace(
      /[^a-z0-9]+/g,
      " ",
    )
    .split(/\s+/)
    .filter(Boolean);
}

function expandConcentrationAliases(
  value: string,
) {
  return value
    .replace(
      /\bEDP\b/gi,
      "Eau de Parfum",
    )
    .replace(
      /\bEDT\b/gi,
      "Eau de Toilette",
    )
    .replace(
      /\bEDC\b/gi,
      "Eau de Cologne",
    );
}

function baseFragranceName(
  value: string,
) {
  return normalizeEntityLabel(
    expandConcentrationAliases(
      value,
    ),
  )
    .toLowerCase()
    .replace(
      /\b(eau de parfum|eau de toilette|eau de cologne|extrait de parfum|parfum|extrait|elixir|intense|absolu|absolute|cologne|edp|edt|edc)\b/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalConcentration(
  value: string,
) {
  const normalized =
    normalizeComparable(
      expandConcentrationAliases(
        value,
      ),
    );

  if (
    normalized ===
      "eau de parfum" ||
    normalized === "edp"
  ) {
    return "eau-de-parfum";
  }

  if (
    normalized ===
      "eau de toilette" ||
    normalized === "edt"
  ) {
    return "eau-de-toilette";
  }

  if (
    normalized ===
      "eau de cologne" ||
    normalized === "edc"
  ) {
    return "eau-de-cologne";
  }

  if (
    normalized ===
      "extrait de parfum" ||
    normalized === "extrait"
  ) {
    return "extrait-de-parfum";
  }

  return normalizeCanonicalId(
    normalized,
  );
}

function isMissingImportValue(
  value: unknown,
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return true;
  }

  const normalized =
    normalizeComparable(value);

  return [
    "unknown",
    "n/a",
    "na",
    "not available",
  ].includes(normalized);
}

function normalizeComparable(
  value: unknown,
) {
  return normalizeEntityLabel(
    String(value ?? ""),
  ).toLowerCase();
}

function countClassification(
  matches:
    ImportRecordMatch[],
  classification:
    ImportRecordMatch["classification"],
) {
  return matches.filter(
    (match) =>
      match.classification ===
      classification,
  ).length;
}

function clamp(value: number) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(value),
    ),
  );
}
