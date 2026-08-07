import type { CollectionItem, CollectorProfile } from "@/lib/domain/collection";
import type { FragranceRecord } from "@/lib/domain/fragrance";
import { analyzeCollectionHealth } from "@/lib/intelligence/collection-health";
import { evaluateIntelligenceEligibility } from "@/lib/intelligence/readiness-gateway";
export type SimulationAction="add"|"remove"|"replace";
export interface CollectionSimulationInput {action:SimulationAction;candidateId:string;replaceId?:string;collection:CollectionItem[];catalog:FragranceRecord[];profile:CollectorProfile;}
export interface MetricDelta {current:number;projected:number;delta:number;}
export interface CollectionSimulationResult {action:SimulationAction;candidate:FragranceRecord;projectedCollection:CollectionItem[];metrics:{health:MetricDelta;diversity:MetricDelta;redundancy:MetricDelta;rotation:MetricDelta;seasonCoverage:MetricDelta;roleCoverage:MetricDelta;value:MetricDelta;};risk:{score:number;label:string;explanation:string};recommendationChange:string;warnings:string[];}
export function simulateCollectionChange(input:CollectionSimulationInput):CollectionSimulationResult{
 const candidate=input.catalog.find(f=>f.id===input.candidateId); if(!candidate) throw new Error(`Unknown candidate: ${input.candidateId}`);
 let projected=input.collection.map(i=>({...i}));
 if(input.action==="add" && !projected.some(i=>i.fragranceId===candidate.id)) projected.push({fragranceId:candidate.id,wearCount:0,daysSinceLastWear:0,bottleSizeMl:100,fillLevelPercent:100});
 if(input.action==="remove") projected=projected.filter(i=>i.fragranceId!==candidate.id);
 if(input.action==="replace"){if(!input.replaceId) throw new Error("replaceId is required");projected=projected.filter(i=>i.fragranceId!==input.replaceId);if(!projected.some(i=>i.fragranceId===candidate.id)) projected.push({fragranceId:candidate.id,wearCount:0,daysSinceLastWear:0,bottleSizeMl:100,fillLevelPercent:100});}
 const current=analyzeCollectionHealth({collection:input.collection,catalog:input.catalog,profile:input.profile});
 const future=analyzeCollectionHealth({collection:projected,catalog:input.catalog,profile:input.profile});
 const currentValue=value(input.collection,input.catalog); const projectedValue=value(projected,input.catalog);
 const eligibility=evaluateIntelligenceEligibility(candidate); const risk=Math.round(Math.max(0,Math.min(100,(100-eligibility.confidence)*.55+Math.max(0,current.dimensions.redundancy-future.dimensions.redundancy)*-.2+Math.max(0,future.dimensions.redundancy-current.dimensions.redundancy)*.6)));
 const weakest=Object.entries(future.dimensions).filter(([k])=>["diversity","rotation","seasonalBalance","roleCoverage"].includes(k)).sort((a,b)=>a[1]-b[1])[0];
 return {action:input.action,candidate,projectedCollection:projected,metrics:{health:d(current.score,future.score),diversity:d(current.dimensions.diversity,future.dimensions.diversity),redundancy:d(current.dimensions.redundancy,future.dimensions.redundancy),rotation:d(current.dimensions.rotation,future.dimensions.rotation),seasonCoverage:d(current.dimensions.seasonalBalance,future.dimensions.seasonalBalance),roleCoverage:d(current.dimensions.roleCoverage,future.dimensions.roleCoverage),value:d(currentValue,projectedValue)},risk:{score:risk,label:risk<25?"Low":risk<50?"Moderate":risk<75?"High":"Very high",explanation:eligibility.readiness==="partial"?"Partial imported evidence widens the decision risk.":"Risk combines readiness confidence and projected collection redundancy."},recommendationChange:weakest?`After this scenario, ${weakest[0]} remains the next priority at ${weakest[1]}/100.`:"The projected collection is balanced.",warnings:eligibility.warnings};
}
function d(current:number,projected:number){return {current,projected,delta:projected-current}}
function value(items:CollectionItem[],catalog:FragranceRecord[]){return Math.round(items.reduce((s,i)=>{const f=catalog.find(x=>x.id===i.fragranceId);return s+(i.purchasePrice??f?.market?.typicalMarketPrice??f?.market?.retailPrice??0)},0))}
