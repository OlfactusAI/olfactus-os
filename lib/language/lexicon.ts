import type {
  PreferenceDimension,
} from "@/lib/embedding/types";

export const fragranceLanguageLexicon:
  Record<
    string,
    PreferenceDimension
  > = {
    fresh:
      "freshness",
    fresher:
      "freshness",
    freshness:
      "freshness",
    clean:
      "cleanliness",
    cleaner:
      "cleanliness",
    cleanliness:
      "cleanliness",
    airy:
      "airiness",
    airier:
      "airiness",
    light:
      "airiness",
    lighter:
      "airiness",
    sweet:
      "sweetness",
    sweeter:
      "sweetness",
    sugary:
      "sweetness",
    dark:
      "darkness",
    darker:
      "darkness",
    dry:
      "dryness",
    drier:
      "dryness",
    warm:
      "warmth",
    warmer:
      "warmth",
    dense:
      "density",
    denser:
      "density",
    strong:
      "projection",
    stronger:
      "projection",
    powerful:
      "projection",
    loud:
      "projection",
    formal:
      "formality",
    moreformal:
      "formality",
    unusual:
      "novelty",
    unique:
      "novelty",
    stranger:
      "novelty",
    familiar:
      "familiarity",
    creamy:
      "creaminess",
    creamier:
      "creaminess",
    smoky:
      "smokiness",
    smokier:
      "smokiness",
    green:
      "greenness",
    greener:
      "greenness",
    fruity:
      "fruitiness",
    fruitier:
      "fruitiness",
    floral:
      "floral",
    morefloral:
      "floral",
    mineral:
      "mineral",
    metallic:
      "mineral",
    woodier:
      "woodiness",
    woody:
      "woodiness",
    amber:
      "amber",
    complex:
      "complexity",
    morecomplex:
      "complexity",
  };

export const compositeLanguage:
  Record<
    string,
    Array<{
      dimension:
        PreferenceDimension;
      direction:
        "more" |
        "less";
      strength: number;
    }>
  > = {
    "expensive-smelling": [
      {
        dimension:
          "formality",
        direction:
          "more",
        strength: 0.8,
      },
      {
        dimension:
          "complexity",
        direction:
          "more",
        strength: 0.75,
      },
      {
        dimension:
          "novelty",
        direction:
          "more",
        strength: 0.45,
      },
      {
        dimension:
          "density",
        direction:
          "more",
        strength: 0.3,
      },
    ],
    expensive: [
      {
        dimension:
          "formality",
        direction:
          "more",
        strength: 0.7,
      },
      {
        dimension:
          "complexity",
        direction:
          "more",
        strength: 0.65,
      },
    ],
    smooth: [
      {
        dimension:
          "creaminess",
        direction:
          "more",
        strength: 0.6,
      },
      {
        dimension:
          "darkness",
        direction:
          "less",
        strength: 0.2,
      },
    ],
    crisp: [
      {
        dimension:
          "freshness",
        direction:
          "more",
        strength: 0.6,
      },
      {
        dimension:
          "cleanliness",
        direction:
          "more",
        strength: 0.55,
      },
      {
        dimension:
          "sweetness",
        direction:
          "less",
        strength: 0.35,
      },
    ],
  };
