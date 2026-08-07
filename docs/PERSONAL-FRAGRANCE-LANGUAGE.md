# OLFACTUS OS v4.2.0-alpha.1 — Personal Fragrance Language + Preference Embedding

## Personal Fragrance Language — PFL-1.0.0

Natural fragrance language is converted into structured constraints.
Supported concepts include:

- cleaner / fresher / airier
- darker / drier / warmer / denser
- less sweet / sweeter
- stronger / more formal
- unusual / unique
- creamy / smoky / greener / fruitier / floral
- mineral / metallic / woody / complex
- expensive / expensive-smelling

Relative fragrance references are detected from the active catalog, so a
request such as "cleaner than Naxos, less sweet than Layton" can be
evaluated against those reference fragrances.

## Preference Embedding — PEM-1.0.0

Collector taste is represented across 21 dimensions:

freshness, sweetness, darkness, dryness, warmth, density, airiness,
projection, formality, novelty, familiarity, creaminess, smokiness,
greenness, fruitiness, floral, mineral, cleanliness, woodiness, amber,
and complexity.

The collector embedding is derived from owned fragrances, wear frequency,
Memory wear events, favorite status, personal ratings, and recency.

## Semantic Candidate Search — SEM-1.0.0

Global catalog fragrances are embedded into the same space. Semantic
search combines:

- explicit natural-language constraints
- collector preference similarity
- relative reference-fragrance reasoning
- Unified Decision Core scores

The goal is not to treat vague words as objective chemistry. The language
layer translates collector vocabulary into explicit, inspectable
intelligence targets with confidence and model provenance.

## Intelligence API

v4.2 adds:

- getPreferenceEmbedding()
- getFragranceEmbedding(id)
- interpretFragranceRequest(text)
- findSemanticCandidates(text)
- compareInPreferenceSpace(left, right)

## User surfaces

Decision Lab now includes a Personal Fragrance Language field that can
re-rank candidate fragrances before Unified Decision Core evaluation.

The Unified Analyst can intercept descriptive fragrance requests and route
them through PFL + PEM + Semantic Search.
