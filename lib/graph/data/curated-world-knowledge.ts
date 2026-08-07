import type {
  GlobalGraphEntity,
  GlobalGraphRelationship,
} from "@/lib/graph/global-types";
import {
  entityId,
} from "@/lib/graph/entity-registry-v2";

export function getCuratedWorldKnowledge() {
  const entities:
    GlobalGraphEntity[] = [];
  const relationships:
    GlobalGraphRelationship[] = [];

  const register =
    (entity:
      GlobalGraphEntity) => {
      if (
        !entities.some(
          (item) =>
            item.canonicalId ===
            entity.canonicalId,
        )
      ) {
        entities.push(
          entity,
        );
      }
    };

  const edge =
    (
      sourceId: string,
      targetId: string,
      type:
        GlobalGraphRelationship["type"],
      weight: number,
      confidence: number,
      explanation: string,
    ) => {
      relationships.push({
        id:
          `${type}:${sourceId}:${targetId}`,
        sourceId,
        targetId,
        type,
        weight,
        confidence,
        explanation,
        source:
          "curated",
      });
    };

  for (
    const company
    of [
      "Kering",
      "LVMH",
      "L'Oréal",
      "Estée Lauder Companies",
      "Puig",
      "Coty",
      "Richemont",
      "Shiseido",
    ]
  ) {
    register({
      id:
        slug(company),
      canonicalId:
        entityId(
          "company",
          company,
        ),
      type:
        "company",
      name:
        company,
      aliases: [
        company,
      ],
      confidence: 96,
      status:
        "validated",
      metadata: {},
    });
  }

  for (
    const [
      brand,
      company,
    ]
    of [
      ["Creed", "Kering"],
      ["Louis Vuitton", "LVMH"],
      ["Maison Francis Kurkdjian", "LVMH"],
      ["Dior", "LVMH"],
      ["Guerlain", "LVMH"],
      ["Yves Saint Laurent", "L'Oréal"],
      ["Giorgio Armani", "L'Oréal"],
      ["Tom Ford", "Estée Lauder Companies"],
      ["Jean Paul Gaultier", "Puig"],
      ["Rabanne", "Puig"],
    ] as Array<
      [
        string,
        string,
      ]
    >
  ) {
    edge(
      entityId(
        "brand",
        brand,
      ),
      entityId(
        "company",
        company,
      ),
      "owned-by-company",
      100,
      96,
      `${brand} is connected to ${company} in the curated corporate fragrance network.`,
    );
  }

  const collections =
    [
      {
        name:
          "Le Gemme",
        brand:
          "Bvlgari",
        fragrances: [
          "bvlgari-tygar",
        ],
      },
      {
        name:
          "Private Blend",
        brand:
          "Tom Ford",
        fragrances: [
          "tom-ford-oud-wood",
          "tom-ford-tobacco-vanille",
        ],
      },
      {
        name:
          "Les Parfums Louis Vuitton",
        brand:
          "Louis Vuitton",
        fragrances: [
          "louis-vuitton-limmensite",
          "louis-vuitton-afternoon-swim",
          "louis-vuitton-ombre-nomade",
        ],
      },
    ];

  for (
    const collection
    of collections
  ) {
    register({
      id:
        slug(
          collection.name,
        ),
      canonicalId:
        entityId(
          "collection",
          collection.name,
        ),
      type:
        "collection",
      name:
        collection.name,
      aliases: [
        collection.name,
      ],
      confidence: 88,
      status:
        "calibration",
      metadata: {
        brand:
          collection.brand,
      },
    });

    for (
      const fragranceId
      of collection
        .fragrances
    ) {
      edge(
        entityId(
          "fragrance",
          fragranceId,
        ),
        entityId(
          "collection",
          collection.name,
        ),
        "part-of-collection",
        100,
        88,
        `${fragranceId} belongs to ${collection.name}.`,
      );
    }
  }

  for (
    const item
    of [
      {
        source:
          "montblanc-explorer",
        target:
          "creed-aventus",
        type:
          "inspired-by" as const,
        confidence: 78,
      },
      {
        source:
          "club-de-nuit-intense-man",
        target:
          "creed-aventus",
        type:
          "clone-of" as const,
        confidence: 90,
      },
      {
        source:
          "nishane-hacivat",
        target:
          "creed-aventus",
        type:
          "inspired-by" as const,
        confidence: 60,
      },
    ]
  ) {
    edge(
      entityId(
        "fragrance",
        item.source,
      ),
      entityId(
        "fragrance",
        item.target,
      ),
      item.type,
      item.type ===
        "clone-of"
        ? 96
        : 78,
      item.confidence,
      `${item.source} is connected to ${item.target} through curated lineage intelligence.`,
    );
  }

  for (
    const [
      left,
      right,
      weight,
    ]
    of [
      ["bvlgari-tygar", "louis-vuitton-limmensite", 84],
      ["parfums-de-marly-layton", "parfums-de-marly-carlisle", 80],
      ["initio-oud-for-greatness", "maison-crivelli-oud-maracuja", 72],
      ["roja-elysium-pc", "creed-aventus", 76],
    ] as Array<
      [
        string,
        string,
        number,
      ]
    >
  ) {
    edge(
      entityId(
        "fragrance",
        left,
      ),
      entityId(
        "fragrance",
        right,
      ),
      "competes-with",
      weight,
      74,
      `${left} and ${right} are curated as meaningful competitors.`,
    );
  }

  return {
    entities,
    relationships,
  };
}

function slug(
  value: string,
) {
  return value
    .toLowerCase()
    .normalize(
      "NFKD",
    )
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-|-$/g,
      "",
    );
}
