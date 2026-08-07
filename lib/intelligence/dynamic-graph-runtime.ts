import type { CollectionItem } from "@/lib/domain/collection";
import type { FragranceRecord } from "@/lib/domain/fragrance";
import type { KnowledgeGraph, KnowledgeGraphEdge, KnowledgeGraphNode } from "@/lib/graph/types";
import type { TimelineEvent } from "@/lib/timeline/types";
import { evaluateIntelligenceEligibility } from "@/lib/intelligence/readiness-gateway";

export interface DynamicGraphRuntimeInput {
  graph: KnowledgeGraph;
  catalog: FragranceRecord[];
  collection: CollectionItem[];
  timeline: TimelineEvent[];
  recommendationIds?: string[];
}

export function activateDynamicKnowledgeGraph(input: DynamicGraphRuntimeInput): KnowledgeGraph {
  const nodes=[...input.graph.nodes];
  const edges=[...input.graph.edges];
  const nodeIds=new Set(nodes.map(n=>n.id));
  const edgeIds=new Set(edges.map(e=>e.id));
  const addNode=(node:KnowledgeGraphNode)=>{if(!nodeIds.has(node.id)){nodes.push(node);nodeIds.add(node.id)}};
  const addEdge=(edge:KnowledgeGraphEdge)=>{if(!edgeIds.has(edge.id)){edges.push(edge);edgeIds.add(edge.id)}};

  addNode({id:"collection:active",type:"collection",label:"Active Collection",subtitle:`${input.collection.length} owned fragrances`,owned:true,score:100});
  const ownedIds=new Set(input.collection.map(i=>i.fragranceId));
  for(const fragrance of input.catalog){
    const fNode=`fragrance:${fragrance.id}`;
    if(ownedIds.has(fragrance.id) && nodeIds.has(fNode)){
      addEdge({id:`collection:${fragrance.id}`,source:"collection:active",target:fNode,type:"owned-in-collection",strength:100,explanation:`${fragrance.name} is part of the active collection.`});
    }
    if(fragrance.market && nodeIds.has(fNode)){
      const marketId=`market:${fragrance.id}`;
      const value=fragrance.market.typicalMarketPrice ?? fragrance.market.retailPrice ?? 0;
      addNode({id:marketId,type:"market",label:`${fragrance.name} Market`,subtitle:value?`Typical value $${Math.round(value)}`:"Market signal",fragranceId:fragrance.id,score:fragrance.market.valueScore ?? 50,metadata:{retailPrice:fragrance.market.retailPrice ?? 0,typicalMarketPrice:value}});
      addEdge({id:`market-edge:${fragrance.id}`,source:fNode,target:marketId,type:"has-market-signal",strength:Math.max(40,fragrance.market.valueScore ?? 50),explanation:"Connects fragrance identity with live market and value intelligence."});
    }
  }

  for(const id of input.recommendationIds ?? []){
    const fragrance=input.catalog.find(f=>f.id===id); const fNode=`fragrance:${id}`;
    if(!fragrance || !nodeIds.has(fNode)) continue;
    const recId=`recommendation:${id}`;
    addNode({id:recId,type:"recommendation",label:`Recommended: ${fragrance.name}`,subtitle:"Collector intelligence recommendation",fragranceId:id,score:evaluateIntelligenceEligibility(fragrance).confidence});
    addEdge({id:`recommendation-edge:${id}`,source:"collection:active",target:recId,type:"recommended-by",strength:evaluateIntelligenceEligibility(fragrance).confidence,explanation:"Recommendation derived from collection context and fragrance intelligence."});
    addEdge({id:`recommendation-target:${id}`,source:recId,target:fNode,type:"recommended-by",strength:90,explanation:"Recommendation resolves to this fragrance node."});
  }

  for(const event of input.timeline.slice(-40)){
    if(!event.fragranceId) continue;
    const fNode=`fragrance:${event.fragranceId}`; if(!nodeIds.has(fNode)) continue;
    const eventId=`timeline:${event.id}`;
    addNode({id:eventId,type:"timeline-event",label:event.title,subtitle:new Date(event.timestamp).toLocaleDateString(),fragranceId:event.fragranceId,score:70,metadata:{eventType:event.type,timestamp:event.timestamp}});
    addEdge({id:`timeline-edge:${event.id}`,source:fNode,target:eventId,type:"recorded-in-timeline",strength:75,explanation:event.summary});
  }

  return {...input.graph,version:"KGE-1.0.0",generatedAt:new Date().toISOString(),nodes,edges};
}
