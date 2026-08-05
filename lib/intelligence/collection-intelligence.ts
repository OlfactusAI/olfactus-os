import type { FragranceRecord, FragranceRole, Season } from "@/lib/domain/fragrance";

export type CollectionInsightSeverity = "low" | "medium" | "high";
export type CollectionInsightCategory = "coverage" | "season" | "rotation" | "concentration" | "identity" | "opportunity";

export interface CollectionIntelligenceOwnedItem {
  fragrance: FragranceRecord;
  item: { wearCount?: number; daysSinceLastWear: number };
}

export interface CollectionHealthSnapshot {
  score: number;
  status: string;
  summary: string;
  confidence?: number;
}

export interface CollectionInsight {
  id: string;
  category: CollectionInsightCategory;
  severity: CollectionInsightSeverity;
  title: string;
  explanation: string;
  evidence: string[];
  action?: string;
  projectedImpact?: number;
}

export interface CollectionIntelligenceOutput {
  health: CollectionHealthSnapshot;
  collectionSize: number;
  totalWears: number;
  strongestSeason: { season: Season; score: number } | null;
  weakestSeason: { season: Season; score: number } | null;
  strongestRoles: { role: FragranceRole; coverage: number }[];
  missingRoles: FragranceRole[];
  neglectedFragrances: { fragranceId: string; fragranceName: string; daysSinceLastWear: number }[];
  dominantFamilies: { family: string; count: number; percentage: number }[];
  insights: CollectionInsight[];
  priorityInsight: CollectionInsight | null;
  confidence: number;
  generatedAt: string;
  modelVersion: "CIE-1.0.0";
}

interface Input { owned: CollectionIntelligenceOwnedItem[]; health: CollectionHealthSnapshot; now?: Date }
const trackedRoles: FragranceRole[] = ["office","casual","date","formal","summer","winter","creative","signature","travel"];
const seasons: Season[] = ["spring","summer","fall","winter"];
const average = (values: number[]) => values.length ? values.reduce((a,b)=>a+b,0)/values.length : 0;
const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function analyzeCollectionIntelligence({ owned, health, now = new Date() }: Input): CollectionIntelligenceOutput {
  const seasonRows = seasons.map((season) => ({
    season,
    score: Math.round(average(owned.map(({fragrance}) => fragrance.seasons[season]).sort((a,b)=>b-a).slice(0,3))),
  })).sort((a,b)=>b.score-a.score);
  const roleRows = trackedRoles.map((role) => {
    const count = owned.filter(({fragrance}) => fragrance.roles.includes(role)).length;
    return { role, coverage: count === 0 ? 0 : count === 1 ? 68 : count === 2 ? 88 : 100 };
  }).sort((a,b)=>b.coverage-a.coverage);
  const missingRoles = roleRows.filter((r)=>r.coverage===0).map((r)=>r.role);
  const neglectedFragrances = owned.filter(({item})=>item.daysSinceLastWear>=30).map(({fragrance,item})=>({fragranceId:fragrance.id, fragranceName:`${fragrance.brand} ${fragrance.name}`, daysSinceLastWear:item.daysSinceLastWear})).sort((a,b)=>b.daysSinceLastWear-a.daysSinceLastWear);
  const familyCounts = new Map<string,number>();
  owned.forEach(({fragrance})=>familyCounts.set(fragrance.family,(familyCounts.get(fragrance.family)??0)+1));
  const dominantFamilies = [...familyCounts].map(([family,count])=>({family,count,percentage:owned.length?Math.round(count/owned.length*100):0})).sort((a,b)=>b.count-a.count);
  const insights: CollectionInsight[] = [];
  if (missingRoles[0]) insights.push({id:`missing-role-${missingRoles[0]}`,category:"coverage",severity:"high",title:`${missingRoles[0]} coverage is missing`,explanation:`Your collection does not currently contain a clear fragrance for the ${missingRoles[0]} role.`,evidence:missingRoles,action:`Explore one fragrance designed for the ${missingRoles[0]} role.`,projectedImpact:4});
  const weakest = seasonRows.at(-1) ?? null;
  if (weakest && weakest.score < 70) insights.push({id:`weak-season-${weakest.season}`,category:"season",severity:weakest.score<50?"high":"medium",title:`${weakest.season} is your weakest season`,explanation:`Your strongest options average ${weakest.score}/100 for ${weakest.season}.`,evidence:[`Season score: ${weakest.score}`],action:`Strengthen ${weakest.season} coverage with a distinct role.`,projectedImpact:3});
  if (neglectedFragrances[0]) insights.push({id:`rotation-${neglectedFragrances[0].fragranceId}`,category:"rotation",severity:neglectedFragrances[0].daysSinceLastWear>=60?"high":"medium",title:`${neglectedFragrances[0].fragranceName} needs attention`,explanation:`It has not been worn in ${neglectedFragrances[0].daysSinceLastWear} days.`,evidence:neglectedFragrances.slice(0,3).map((x)=>`${x.fragranceName}: ${x.daysSinceLastWear} days`),action:`Wear ${neglectedFragrances[0].fragranceName} during an appropriate upcoming occasion.`,projectedImpact:2});
  const totalWears = owned.reduce((sum,{item})=>sum+(item.wearCount??0),0);
  const confidence = Math.round(clamp((health.confidence??85)*0.6 + Math.min(100,55+owned.length*4+Math.min(totalWears,100)*0.15)*0.4));
  return {health,collectionSize:owned.length,totalWears,strongestSeason:seasonRows[0]??null,weakestSeason:weakest,strongestRoles:roleRows.filter((r)=>r.coverage>=88).slice(0,4),missingRoles,neglectedFragrances,dominantFamilies,insights,priorityInsight:insights[0]??null,confidence,generatedAt:now.toISOString(),modelVersion:"CIE-1.0.0"};
}
