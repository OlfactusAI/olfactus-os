import { fragrances } from "@/lib/data/fragrances";
import { buildKnowledgeGraph } from "@/lib/intelligence/knowledge-graph";

export const knowledgeGraph = buildKnowledgeGraph(fragrances);