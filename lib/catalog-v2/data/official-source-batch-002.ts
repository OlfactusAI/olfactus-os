import type {
  CatalogImportRow,
  CatalogSourceProvenance,
  CatalogV2Record,
} from "@/lib/catalog-v2/types";
import {
  previewCatalogImport,
} from "@/lib/catalog-v2/import-engine";
import {
  createCatalogStagingStore,
} from "@/lib/catalog-v2/staging/store";
import {
  activateCatalogV2Batch,
} from "@/lib/catalog-v2/activation/bridge";

export interface OfficialSourceBatchDescriptor {
  id: string;
  house: string;
  sourceName: string;
  sourceUrl: string;
  confidence: number;
  rows: CatalogImportRow[];
}

export const officialSourceBatch002 =
[
  {
    "id": "ysl-mens-official",
    "house": "Yves Saint Laurent",
    "sourceName": "YSL Beauty — Men's Fragrances",
    "sourceUrl": "https://www.yslbeautyus.com/fragrance/mens-fragrances/",
    "confidence": 99,
    "rows": [
      {
        "brand": "Yves Saint Laurent",
        "name": "Y Eau de Parfum",
        "concentration": "Eau de Parfum",
        "genderPositioning": "Masculine",
        "country": "France"
      },
      {
        "brand": "Yves Saint Laurent",
        "name": "L'Homme Eau de Toilette",
        "concentration": "Eau de Toilette",
        "genderPositioning": "Masculine",
        "country": "France"
      },
      {
        "brand": "Yves Saint Laurent",
        "name": "La Nuit de L'Homme Eau de Toilette",
        "concentration": "Eau de Toilette",
        "genderPositioning": "Masculine",
        "country": "France"
      },
      {
        "brand": "Yves Saint Laurent",
        "name": "MYSLF Eau de Parfum",
        "concentration": "Eau de Parfum",
        "genderPositioning": "Masculine",
        "country": "France"
      }
    ]
  },
  {
    "id": "ysl-libre-official",
    "house": "Yves Saint Laurent",
    "sourceName": "YSL Beauty — Libre Eau de Parfum",
    "sourceUrl": "https://www.yslbeautyus.com/fragrance/womens-fragrances/libre/libre-eau-de-parfum/109YSL.html",
    "confidence": 99,
    "rows": [
      {
        "brand": "Yves Saint Laurent",
        "name": "Libre Eau de Parfum",
        "concentration": "Eau de Parfum",
        "family": "Floral",
        "genderPositioning": "Feminine",
        "country": "France"
      }
    ]
  },
  {
    "id": "armani-acqua-di-gio-official",
    "house": "Giorgio Armani",
    "sourceName": "Giorgio Armani Beauty — Acqua di Giò",
    "sourceUrl": "https://www.giorgioarmanibeauty-usa.com/fragrances/mens-cologne/acqua-di-gio/acqua-di-gio-eau-de-toilette/A005.html",
    "confidence": 99,
    "rows": [
      {
        "brand": "Giorgio Armani",
        "name": "Acqua di Giò Eau de Toilette",
        "concentration": "Eau de Toilette",
        "genderPositioning": "Masculine",
        "country": "Italy"
      },
      {
        "brand": "Giorgio Armani",
        "name": "Acqua di Giò Parfum",
        "concentration": "Parfum",
        "genderPositioning": "Masculine",
        "country": "Italy"
      }
    ]
  },
  {
    "id": "armani-code-official",
    "house": "Giorgio Armani",
    "sourceName": "Giorgio Armani Beauty — Armani Code",
    "sourceUrl": "https://www.giorgioarmanibeauty-usa.com/fragrances/mens-cologne/armani-code/",
    "confidence": 99,
    "rows": [
      {
        "brand": "Giorgio Armani",
        "name": "Armani Code Parfum",
        "concentration": "Parfum",
        "genderPositioning": "Masculine",
        "country": "Italy"
      }
    ]
  },
  {
    "id": "armani-stronger-with-you-official",
    "house": "Giorgio Armani",
    "sourceName": "Giorgio Armani Beauty — Stronger With You",
    "sourceUrl": "https://www.giorgioarmanibeauty-usa.com/fragrances/view-all-fragrances/stronger-with-you-eau-de-toilette/A2061.html",
    "confidence": 99,
    "rows": [
      {
        "brand": "Giorgio Armani",
        "name": "Stronger With You Eau de Toilette",
        "concentration": "Eau de Toilette",
        "genderPositioning": "Masculine",
        "notes": [
          "Pink pepper",
          "Chestnut"
        ],
        "country": "Italy"
      },
      {
        "brand": "Giorgio Armani",
        "name": "Stronger With You Intensely",
        "concentration": "Eau de Parfum",
        "genderPositioning": "Masculine",
        "family": "Warm Woody",
        "notes": [
          "Pink pepper",
          "Amber"
        ],
        "country": "Italy"
      }
    ]
  },
  {
    "id": "valentino-born-in-roma-official",
    "house": "Valentino",
    "sourceName": "Valentino Beauty — Born in Roma",
    "sourceUrl": "https://www.valentino-beauty.us/born-in-roma.html",
    "confidence": 99,
    "rows": [
      {
        "brand": "Valentino",
        "name": "Born in Roma Uomo Eau de Toilette",
        "concentration": "Eau de Toilette",
        "genderPositioning": "Masculine",
        "family": "Woody, Floral & Spicy",
        "country": "Italy"
      },
      {
        "brand": "Valentino",
        "name": "Born in Roma Uomo Intense",
        "concentration": "Eau de Parfum",
        "genderPositioning": "Masculine",
        "country": "Italy"
      },
      {
        "brand": "Valentino",
        "name": "Born in Roma Donna Eau de Parfum",
        "concentration": "Eau de Parfum",
        "genderPositioning": "Feminine",
        "notes": [
          "Sambac jasmine",
          "Cashmeran",
          "Vanilla"
        ],
        "country": "Italy"
      },
      {
        "brand": "Valentino",
        "name": "Born in Roma Donna Intense",
        "concentration": "Eau de Parfum",
        "genderPositioning": "Feminine",
        "family": "Floral Amber",
        "notes": [
          "Vanilla",
          "Jasmine"
        ],
        "country": "Italy"
      }
    ]
  },
  {
    "id": "initio-iconics-official",
    "house": "Initio",
    "sourceName": "INITIO Parfums Privés — Official Collection",
    "sourceUrl": "https://us.initioparfums.com/",
    "confidence": 99,
    "rows": [
      {
        "brand": "Initio",
        "name": "Side Effect",
        "concentration": "Eau de Parfum",
        "family": "Ambery, Spicy",
        "notes": [
          "Tobacco",
          "Vanilla",
          "Rum",
          "Cinnamon"
        ],
        "country": "France"
      },
      {
        "brand": "Initio",
        "name": "Oud for Greatness",
        "concentration": "Eau de Parfum",
        "family": "Woody, Amber, Floral Ambery",
        "notes": [
          "Oud",
          "Patchouli",
          "Musk",
          "Lavender",
          "Nutmeg",
          "Saffron"
        ],
        "country": "France"
      },
      {
        "brand": "Initio",
        "name": "Rehab",
        "concentration": "Eau de Parfum",
        "family": "Woody, Spicy",
        "notes": [
          "Bergamot",
          "Black pepper",
          "Lavender",
          "Sandalwood",
          "Musk"
        ],
        "country": "France"
      },
      {
        "brand": "Initio",
        "name": "Atomic Rose",
        "concentration": "Eau de Parfum",
        "family": "Floral, Rose Violet",
        "country": "France"
      },
      {
        "brand": "Initio",
        "name": "Musk Therapy",
        "concentration": "Extrait de Parfum",
        "family": "Floral Ambery, Fruity",
        "country": "France"
      },
      {
        "brand": "Initio",
        "name": "Narcotic Delight",
        "concentration": "Eau de Parfum",
        "family": "Ambery, Fruity",
        "country": "France"
      }
    ]
  },
  {
    "id": "penhaligons-core-official",
    "house": "Penhaligon's",
    "sourceName": "Penhaligon's — Official Fragrances",
    "sourceUrl": "https://www.penhaligons.com/us/en/",
    "confidence": 99,
    "rows": [
      {
        "brand": "Penhaligon's",
        "name": "The Blazing Mister Sam",
        "concentration": "Eau de Parfum",
        "notes": [
          "Spices",
          "Cedar",
          "Patchouli"
        ],
        "country": "United Kingdom"
      },
      {
        "brand": "Penhaligon's",
        "name": "Halfeti",
        "concentration": "Eau de Parfum",
        "notes": [
          "Rose",
          "Grapefruit",
          "Spice"
        ],
        "country": "United Kingdom"
      },
      {
        "brand": "Penhaligon's",
        "name": "Endymion",
        "concentration": "Eau de Cologne",
        "notes": [
          "Bergamot",
          "Suede",
          "Geranium"
        ],
        "country": "United Kingdom"
      },
      {
        "brand": "Penhaligon's",
        "name": "Cairo",
        "concentration": "Eau de Parfum",
        "notes": [
          "Rose",
          "Saffron accord",
          "Patchouli"
        ],
        "country": "United Kingdom"
      },
      {
        "brand": "Penhaligon's",
        "name": "Juniper Sling",
        "concentration": "Eau de Toilette",
        "notes": [
          "Juniper berry",
          "Black pepper",
          "Vetiver"
        ],
        "country": "United Kingdom"
      },
      {
        "brand": "Penhaligon's",
        "name": "Empressa",
        "concentration": "Eau de Parfum",
        "notes": [
          "Peach",
          "Vanilla",
          "Blood orange"
        ],
        "country": "United Kingdom"
      }
    ]
  },
  {
    "id": "le-labo-classics-official",
    "house": "Le Labo",
    "sourceName": "Le Labo — Classic Collection",
    "sourceUrl": "https://www.lelabofragrances.com/",
    "confidence": 99,
    "rows": [
      {
        "brand": "Le Labo",
        "name": "SANTAL 33",
        "concentration": "Eau de Parfum",
        "notes": [
          "Cardamom",
          "Iris",
          "Violet",
          "Australian sandalwood",
          "Cedarwood"
        ],
        "country": "United States"
      },
      {
        "brand": "Le Labo",
        "name": "ANOTHER 13",
        "concentration": "Eau de Parfum",
        "notes": [
          "Ambroxyde",
          "Jasmine",
          "Moss"
        ],
        "country": "United States"
      },
      {
        "brand": "Le Labo",
        "name": "THÉ MATCHA 26",
        "concentration": "Eau de Parfum",
        "country": "United States"
      },
      {
        "brand": "Le Labo",
        "name": "THÉ NOIR 29",
        "concentration": "Eau de Parfum",
        "notes": [
          "Bergamot",
          "Fig",
          "Bay leaves",
          "Cedarwood",
          "Vetiver",
          "Musk",
          "Black tea"
        ],
        "country": "United States"
      }
    ]
  },
  {
    "id": "diptyque-edp-official",
    "house": "Diptyque",
    "sourceName": "Diptyque — Eaux de Parfum",
    "sourceUrl": "https://us.diptyqueparis.com/en-us/collections/eaux-de-parfum",
    "confidence": 99,
    "rows": [
      {
        "brand": "Diptyque",
        "name": "Orphéon",
        "concentration": "Eau de Parfum",
        "notes": [
          "Tonka bean"
        ],
        "country": "France"
      },
      {
        "brand": "Diptyque",
        "name": "Philosykos",
        "concentration": "Eau de Parfum",
        "country": "France"
      },
      {
        "brand": "Diptyque",
        "name": "Tam Dao",
        "concentration": "Eau de Parfum",
        "notes": [
          "Sandalwood"
        ],
        "country": "France"
      },
      {
        "brand": "Diptyque",
        "name": "Eau Duelle",
        "concentration": "Eau de Parfum",
        "notes": [
          "Bourbon vanilla",
          "Pink peppercorn",
          "Cypriol",
          "Incense"
        ],
        "country": "France"
      }
    ]
  },
  {
    "id": "byredo-icons-official",
    "house": "Byredo",
    "sourceName": "BYREDO — Official Perfume Icons",
    "sourceUrl": "https://www.byredo.com/",
    "confidence": 99,
    "rows": [
      {
        "brand": "Byredo",
        "name": "Mojave Ghost",
        "concentration": "Eau de Parfum",
        "notes": [
          "Magnolia",
          "Sandalwood",
          "Violet",
          "Cedarwood",
          "Musks",
          "Vetiver"
        ],
        "country": "Sweden"
      },
      {
        "brand": "Byredo",
        "name": "Bal d'Afrique",
        "concentration": "Eau de Parfum",
        "country": "Sweden"
      },
      {
        "brand": "Byredo",
        "name": "Gypsy Water",
        "concentration": "Eau de Parfum",
        "family": "Woody Aromatic",
        "notes": [
          "Bergamot",
          "Lemon",
          "Juniper berries",
          "Pepper",
          "Incense",
          "Iris",
          "Pine needle"
        ],
        "country": "Sweden"
      },
      {
        "brand": "Byredo",
        "name": "Blanche",
        "concentration": "Eau de Parfum",
        "country": "Sweden"
      },
      {
        "brand": "Byredo",
        "name": "Rose of No Man's Land",
        "concentration": "Eau de Parfum",
        "country": "Sweden"
      }
    ]
  },
  {
    "id": "essential-parfums-official",
    "house": "Essential Parfums",
    "sourceName": "Essential Parfums — Official Collection",
    "sourceUrl": "https://www.essentialparfums.com/en",
    "confidence": 99,
    "rows": [
      {
        "brand": "Essential Parfums",
        "name": "Bois Impérial",
        "concentration": "Eau de Parfum",
        "perfumers": [
          "Quentin Bisch"
        ],
        "notes": [
          "Timut pepper",
          "Akigalawood"
        ],
        "country": "France"
      },
      {
        "brand": "Essential Parfums",
        "name": "Fig Infusion",
        "concentration": "Eau de Parfum",
        "perfumers": [
          "Nathalie Lorson"
        ],
        "notes": [
          "Fig",
          "Mandarin",
          "Clementine",
          "Freesia",
          "Orange blossom",
          "Black tea",
          "Cedarwood",
          "Sandalwood"
        ],
        "country": "France"
      },
      {
        "brand": "Essential Parfums",
        "name": "Nice Bergamote",
        "concentration": "Eau de Parfum",
        "notes": [
          "Calabrian bergamot",
          "Rose",
          "Jasmine",
          "Ylang ylang",
          "Cedarwood",
          "Tonka bean"
        ],
        "country": "France"
      },
      {
        "brand": "Essential Parfums",
        "name": "Mon Vetiver",
        "concentration": "Eau de Parfum",
        "country": "France"
      },
      {
        "brand": "Essential Parfums",
        "name": "The Musc",
        "concentration": "Eau de Parfum",
        "country": "France"
      },
      {
        "brand": "Essential Parfums",
        "name": "Divine Vanille",
        "concentration": "Eau de Parfum",
        "country": "France"
      }
    ]
  },
  {
    "id": "guerlain-fragrance-official",
    "house": "Guerlain",
    "sourceName": "Guerlain — Official Fragrance Collection",
    "sourceUrl": "https://www.guerlain.com/us/en-us/fragrance/",
    "confidence": 99,
    "rows": [
      {
        "brand": "Guerlain",
        "name": "L'Homme Idéal Eau de Parfum",
        "concentration": "Eau de Parfum",
        "country": "France"
      },
      {
        "brand": "Guerlain",
        "name": "L'Homme Idéal Parfum",
        "concentration": "Parfum",
        "country": "France"
      },
      {
        "brand": "Guerlain",
        "name": "Habit Rouge Eau de Parfum",
        "concentration": "Eau de Parfum",
        "family": "Woody Leather",
        "notes": [
          "Vanilla"
        ],
        "country": "France"
      },
      {
        "brand": "Guerlain",
        "name": "Shalimar Eau de Parfum",
        "concentration": "Eau de Parfum",
        "family": "Ambery",
        "notes": [
          "Bergamot",
          "Iris",
          "Vanilla"
        ],
        "country": "France"
      },
      {
        "brand": "Guerlain",
        "name": "Aqua Allegoria Mandarine Basilic",
        "concentration": "Eau de Toilette",
        "country": "France"
      }
    ]
  }
] satisfies OfficialSourceBatchDescriptor[];

export function countOfficialSourceBatch002Rows() {
  return officialSourceBatch002.reduce(
    (total, source) => total + source.rows.length,
    0,
  );
}

export function getOfficialSourceBatch002Houses() {
  return [
    ...new Set(
      officialSourceBatch002.map((source) => source.house),
    ),
  ];
}

export function previewOfficialSourceBatch002({
  existing = [],
}: {
  existing?: CatalogV2Record[];
} = {}) {
  const previews =
    officialSourceBatch002.map(
      (source) => {
        const provenance =
          buildProvenance(source);

        return {
          source,
          preview:
            previewCatalogImport({
              rows: source.rows,
              provenance,
              existing,
            }),
        };
      },
    );

  return {
    sources: previews.length,
    houses: getOfficialSourceBatch002Houses(),
    incoming: countOfficialSourceBatch002Rows(),
    accepted: previews.reduce(
      (total, item) =>
        total + item.preview.accepted.length,
      0,
    ),
    rejected: previews.reduce(
      (total, item) =>
        total + item.preview.rejected.length,
      0,
    ),
    duplicateCandidates:
      previews.flatMap(
        (item) =>
          item.preview.duplicateCandidates,
      ),
    records:
      previews.flatMap(
        (item) =>
          item.preview.accepted,
      ),
  };
}

export function stageOfficialSourceBatch002({
  existing = [],
}: {
  existing?: CatalogV2Record[];
} = {}) {
  const preview =
    previewOfficialSourceBatch002({ existing });
  const staging =
    createCatalogStagingStore();

  const staged =
    preview.records.map(
      (record) =>
        staging.stage({ record }),
    );

  return {
    ...preview,
    staging,
    staged,
  };
}

export function activateOfficialSourceBatch002({
  existing = [],
}: {
  existing?: CatalogV2Record[];
} = {}) {
  const staged =
    stageOfficialSourceBatch002({ existing });

  const activation =
    activateCatalogV2Batch({
      records: staged.staged,
    });

  const levels =
    activation.activated.reduce(
      (output, entity) => {
        output[entity.level] =
          (output[entity.level] ?? 0) + 1;
        return output;
      },
      {} as Record<string, number>,
    );

  return {
    ...staged,
    activation,
    levels,
  };
}

function buildProvenance(
  source: OfficialSourceBatchDescriptor,
): CatalogSourceProvenance {
  return {
    sourceId: source.id,
    sourceKind: "curated",
    sourceName: source.sourceName,
    importedAt: "2026-08-07T22:00:00.000Z",
    retrievedAt: "2026-08-07T22:00:00.000Z",
    sourceUrl: source.sourceUrl,
    confidence: source.confidence,
  };
}
