import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  canCommitImportSession,
  commitImportSession,
  createImportSession,
  parseImportPayload,
  resolveImportConflict,
  updateImportDecision,
} from "@/lib/database/import";

const catalog:
  FragranceRecord[] = [
    {
      id: "atlas-edp",
      brand: "Example",
      name: "Atlas",
      concentration:
        "Eau de Parfum",
      releaseYear: 2020,
      family:
        "Woody Aromatic",
      perfumers: [
        "Example Nose",
      ],
      notes: {
        top: ["Bergamot"],
        heart: ["Lavender"],
        base: ["Cedar"],
      },
      accords: [
        "Woody",
      ],
      roles: [
        "office",
      ],
      seasons: {
        spring: 80,
        summer: 70,
        fall: 75,
        winter: 60,
      },
      dna: {
        fresh: 70,
        green: 40,
        woody: 75,
        amber: 30,
        sweet: 20,
        dark: 25,
        artistic: 65,
        formal: 75,
      },
      moods: [
        "refined",
      ],
      performance: {
        longevity: 78,
        projection: 72,
      },
      intelligenceStatus:
        "validated",
    },
  ];

describe("Import Preview and Commit Pipeline", () => {
  it("creates a staged preview session", () => {
    const parsed =
      parseImportPayload({
        format: "json",
        input: JSON.stringify([
          {
            name:
              "Solaris One",
            brand:
              "Independent House",
            concentration:
              "Extrait de Parfum",
            family:
              "Floral Amber",
          },
        ]),
      });

    const session =
      createImportSession({
        incoming:
          parsed.records,
        catalog,
        sourceFormat:
          "json",
      });

    expect(
      session.records,
    ).toHaveLength(1);
    expect(
      session.records[0]
        .decision,
    ).toBe("create");
    expect(
      session.summary.create,
    ).toBe(1);
    expect(
      canCommitImportSession(
        session,
      ),
    ).toBe(true);
  });

  it("requires review decisions before commit", () => {
    const parsed =
      parseImportPayload({
        format: "json",
        input: JSON.stringify([
          {
            name:
              "Atlas Eau de Toilette",
            brand: "Example",
            concentration:
              "Eau de Toilette",
            releaseYear: 2019,
            family:
              "Woody Aromatic",
          },
        ]),
      });

    const session =
      createImportSession({
        incoming:
          parsed.records,
        catalog,
        sourceFormat:
          "json",
      });

    if (
      session.records[0]
        .decision === "review"
    ) {
      expect(
        canCommitImportSession(
          session,
        ),
      ).toBe(false);

      const approved =
        updateImportDecision({
          session,
          stageId:
            session.records[0]
              .stageId,
          decision: "create",
        });

      expect(
        canCommitImportSession(
          approved,
        ),
      ).toBe(true);
    } else {
      expect(
        canCommitImportSession(
          session,
        ),
      ).toBe(true);
    }
  });

  it("commits newly created fragrances", () => {
    const parsed =
      parseImportPayload({
        format: "json",
        input: JSON.stringify([
          {
            name:
              "Solaris One",
            brand:
              "Independent House",
            concentration:
              "Extrait de Parfum",
            family:
              "Floral Amber",
          },
        ]),
      });

    const session =
      createImportSession({
        incoming:
          parsed.records,
        catalog,
        sourceFormat:
          "json",
      });

    const result =
      commitImportSession({
        session,
        catalog,
      });

    expect(
      result.catalog,
    ).toHaveLength(2);
    expect(
      result.report.createdCount,
    ).toBe(1);
    expect(
      result.report.success,
    ).toBe(true);
  });

  it("commits safe updates to existing records", () => {
    const parsed =
      parseImportPayload({
        format: "json",
        input: JSON.stringify([
          {
            id: "atlas-edp",
            name: "Atlas",
            brand: "Example",
            concentration:
              "Eau de Parfum",
            releaseYear: 2020,
            family:
              "Woody Aromatic",
            perfumers:
              "Example Nose",
            topNotes:
              "Bergamot",
            heartNotes:
              "Lavender",
            baseNotes:
              "Cedar",
            accords:
              "Woody; Aromatic",
          },
        ]),
      });

    let session =
      createImportSession({
        incoming:
          parsed.records,
        catalog,
        sourceFormat:
          "json",
      });

    session =
      updateImportDecision({
        session,
        stageId:
          session.records[0]
            .stageId,
        decision: "merge",
        selectedExistingFragranceId:
          "atlas-edp",
      });

    for (const conflict of session.records[0].match.conflicts) {
      if (
        conflict.status ===
        "conflict"
      ) {
        session =
          resolveImportConflict({
            session,
            stageId:
              session.records[0]
                .stageId,
            field:
              conflict.field,
            resolution:
              "merge",
          });
      }
    }

    expect(
      canCommitImportSession(
        session,
      ),
    ).toBe(true);

    const result =
      commitImportSession({
        session,
        catalog,
      });

    expect(
      result.report.mergedCount,
    ).toBe(1);
    expect(
      result.catalog[0]
        .accords,
    ).toContain("Aromatic");
  });

  it("prevents committing unresolved conflicting updates", () => {
    const parsed =
      parseImportPayload({
        format: "json",
        input: JSON.stringify([
          {
            id: "atlas-edp",
            name: "Atlas",
            brand: "Example",
            concentration:
              "Eau de Parfum",
            releaseYear: 2024,
            family:
              "Amber Floral",
          },
        ]),
      });

    let session =
      createImportSession({
        incoming:
          parsed.records,
        catalog,
        sourceFormat:
          "json",
      });

    session =
      updateImportDecision({
        session,
        stageId:
          session.records[0]
            .stageId,
        decision: "update",
        selectedExistingFragranceId:
          "atlas-edp",
      });

    expect(
      canCommitImportSession(
        session,
      ),
    ).toBe(false);

    expect(() =>
      commitImportSession({
        session,
        catalog,
      }),
    ).toThrow(
      "Import session is not ready to commit.",
    );
  });
});
