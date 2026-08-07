import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import type {
  PreferenceEmbedding,
} from "@/lib/embedding/types";

const zero:
  PreferenceEmbedding = {
    freshness: 0,
    sweetness: 0,
    darkness: 0,
    dryness: 0,
    warmth: 0,
    density: 0,
    airiness: 0,
    projection: 0,
    formality: 0,
    novelty: 0,
    familiarity: 0,
    creaminess: 0,
    smokiness: 0,
    greenness: 0,
    fruitiness: 0,
    floral: 0,
    mineral: 0,
    cleanliness: 0,
    woodiness: 0,
    amber: 0,
    complexity: 0,
  };

export function embedFragrance(
  fragrance:
    FragranceRecord,
): PreferenceEmbedding {
  const accords =
    new Set(
      (
        fragrance.accords ??
        []
      ).map(
        (accord) =>
          accord.toLowerCase(),
      ),
    );
  const family =
    fragrance.family
      .toLowerCase();
  const moods =
    new Set(
      fragrance.moods.map(
        (mood) =>
          mood.toLowerCase(),
      ),
    );

  const freshness =
    clamp(
      fragrance.dna.fresh *
        0.74 +
        fragrance.dna.green *
          0.16 +
        (
          family.includes(
            "citrus",
          ) ||
          family.includes(
            "marine",
          ) ||
          family.includes(
            "aquatic",
          )
            ? 12
            : 0
        ),
    );

  const sweetness =
    clamp(
      fragrance.dna.sweet *
        0.84 +
        (
          family.includes(
            "gourmand",
          ) ||
          family.includes(
            "vanilla",
          )
            ? 14
            : 0
        ),
    );

  const darkness =
    clamp(
      fragrance.dna.dark *
        0.82 +
        fragrance.dna.amber *
          0.08 +
        (
          family.includes(
            "oud",
          ) ||
          family.includes(
            "leather",
          ) ||
          family.includes(
            "tobacco",
          )
            ? 10
            : 0
        ),
    );

  const dryness =
    clamp(
      fragrance.dna.woody *
        0.42 +
        fragrance.dna.green *
          0.18 +
        (
          moods.has(
            "dry",
          )
            ? 30
            : 0
        ) -
        sweetness *
          0.16,
    );

  const warmth =
    clamp(
      fragrance.dna.amber *
        0.52 +
        sweetness *
          0.22 +
        fragrance.dna.dark *
          0.12 +
        (
          family.includes(
            "spicy",
          )
            ? 12
            : 0
        ),
    );

  const density =
    clamp(
      fragrance.performance
        .longevity *
        0.28 +
        fragrance.performance
          .projection *
          0.22 +
        darkness *
          0.24 +
        sweetness *
          0.14 +
        fragrance.dna.amber *
          0.12,
    );

  const airiness =
    clamp(
      freshness *
        0.52 +
        (
          100 -
          density
        ) *
          0.34 +
        (
          moods.has(
            "airy",
          )
            ? 20
            : 0
        ),
    );

  const formality =
    clamp(
      fragrance.dna.formal *
        0.82 +
        (
          fragrance.roles.includes(
            "formal",
          )
            ? 14
            : 0
        ),
    );

  const greenness =
    clamp(
      fragrance.dna.green *
        0.84 +
        (
          family.includes(
            "green",
          )
            ? 14
            : 0
        ),
    );

  const fruitiness =
    clamp(
      (
        family.includes(
          "fruity",
        )
          ? 72
          : 18
      ) +
        (
          accords.has(
            "fruity",
          )
            ? 18
            : 0
        ) +
        fragrance.dna.sweet *
          0.12,
    );

  const floral =
    clamp(
      (
        family.includes(
          "floral",
        )
          ? 74
          : 14
      ) +
        (
          accords.has(
            "floral",
          )
            ? 18
            : 0
        ),
    );

  const smokiness =
    clamp(
      (
        family.includes(
          "smoky",
        ) ||
        moods.has(
          "smoky",
        )
          ? 72
          : 12
      ) +
        fragrance.dna.dark *
          0.18,
    );

  const mineral =
    clamp(
      (
        moods.has(
          "metallic",
        ) ||
        moods.has(
          "mineral",
        )
          ? 74
          : 18
      ) +
        fragrance.dna.artistic *
          0.12,
    );

  const cleanliness =
    clamp(
      freshness *
        0.52 +
        airiness *
          0.22 +
        (
          moods.has(
            "clean",
          )
            ? 28
            : 0
        ) -
        darkness *
          0.14,
    );

  const creaminess =
    clamp(
      sweetness *
        0.32 +
        warmth *
          0.26 +
        (
          moods.has(
            "creamy",
          ) ||
          moods.has(
            "smooth",
          )
            ? 34
            : 0
        ),
    );

  const familiarity =
    clamp(
      (
        fragrance.roles.includes(
          "office",
        )
          ? 18
          : 0
      ) +
        (
          fragrance.roles.includes(
            "casual",
          )
            ? 14
            : 0
        ) +
        (
          fragrance.dna.artistic <
          55
            ? 42
            : 20
        ),
    );

  const novelty =
    clamp(
      fragrance.dna.artistic *
        0.64 +
        (
          100 -
          familiarity
        ) *
          0.22 +
        mineral *
          0.08 +
        smokiness *
          0.06,
    );

  const complexity =
    clamp(
      fragrance.dna.artistic *
        0.36 +
        density *
          0.2 +
        fragrance.dna.woody *
          0.1 +
        fragrance.dna.amber *
          0.1 +
        fragrance.dna.dark *
          0.08 +
        formality *
          0.08 +
        (
          fragrance.accords
            ?.length ??
          0
        ) *
          2,
    );

  return {
    ...zero,
    freshness,
    sweetness,
    darkness,
    dryness,
    warmth,
    density,
    airiness,
    projection:
      clamp(
        fragrance
          .performance
          .projection,
      ),
    formality,
    novelty,
    familiarity,
    creaminess,
    smokiness,
    greenness,
    fruitiness,
    floral,
    mineral,
    cleanliness,
    woodiness:
      clamp(
        fragrance.dna.woody,
      ),
    amber:
      clamp(
        fragrance.dna.amber,
      ),
    complexity,
  };
}

function clamp(
  value: number,
) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(value),
    ),
  );
}
