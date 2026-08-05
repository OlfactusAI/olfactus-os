import type { FragranceRecord, FragranceRole, Season } from "@/lib/domain/fragrance";

export interface RotationOwnedFragrance { fragrance: FragranceRecord; item: { wearCount?: number; daysSinceLastWear: number } }
export interface RotationContext { season: Season; desiredRole?: FragranceRole; recentWearIds?: string[] }
export interface RotationCandidate { fragranceId:string; fragranceName:string; score:number; daysSinceLastWear:number; wearCount:number; reasons:string[] }
export interface RotationAlert { type:"neglected"|"overused"|"season-mismatch"|"concentrated-rotation"; severity:"low"|"medium"|"high"; title:string; explanation:string; fragranceIds:string[] }
export interface RotationEngineOutput { healthScore:number; status:"healthy"|"imbalanced"|"needs-attention"; nextWear:RotationCandidate|null; alternatives:RotationCandidate[]; neglected:RotationCandidate[]; overused:RotationCandidate[]; alerts:RotationAlert[]; totalWears:number; activeRotationSize:number; confidence:number; generatedAt:string; modelVersion:"ROE-1.0.0" }
interface Input { owned:RotationOwnedFragrance[]; context:RotationContext; now?:Date }
const clamp=(v:number)=>Math.max(0,Math.min(100,v));
const recency=(d:number)=>d>=60?100:d>=45?96:d>=30?90:d>=21?82:d>=14?72:d>=7?58:d>=3?38:18;

export function optimizeRotation({owned,context,now=new Date()}:Input):RotationEngineOutput {
  const candidates=owned.map(({fragrance,item})=>{
    const role=!context.desiredRole?75:fragrance.roles.includes(context.desiredRole)?100:40;
    const penalty=(context.recentWearIds??[]).filter((id)=>id===fragrance.id).length*18;
    const score=Math.round(clamp(recency(item.daysSinceLastWear)*0.45+fragrance.seasons[context.season]*0.35+role*0.2-penalty));
    const reasons:string[]=[];
    if(item.daysSinceLastWear>=30) reasons.push(`Not worn in ${item.daysSinceLastWear} days`);
    if(fragrance.seasons[context.season]>=85) reasons.push(`Excellent ${context.season} suitability`);
    if(context.desiredRole&&fragrance.roles.includes(context.desiredRole)) reasons.push(`Directly supports the ${context.desiredRole} role`);
    if(!reasons.length) reasons.push("Balanced rotation candidate");
    return {fragranceId:fragrance.id,fragranceName:`${fragrance.brand} ${fragrance.name}`,score,daysSinceLastWear:item.daysSinceLastWear,wearCount:item.wearCount??0,reasons};
  }).sort((a,b)=>b.score-a.score||b.daysSinceLastWear-a.daysSinceLastWear);
  const totalWears=candidates.reduce((s,c)=>s+c.wearCount,0);
  const avg=candidates.length?totalWears/candidates.length:0;
  const neglected=candidates.filter((c)=>c.daysSinceLastWear>=30).sort((a,b)=>b.daysSinceLastWear-a.daysSinceLastWear);
  const overused=candidates.filter((c)=>avg>0&&c.wearCount>=avg*1.75).sort((a,b)=>b.wearCount-a.wearCount);
  const activeRotationSize=candidates.filter((c)=>c.daysSinceLastWear<=21).length;
  const healthScore=Math.round(clamp(100-(candidates.length?neglected.length/candidates.length*45:0)-(candidates.length?overused.length/candidates.length*30:0)-(candidates.length&&activeRotationSize<candidates.length*0.5?15:0)));
  const status=healthScore>=82?"healthy":healthScore>=62?"imbalanced":"needs-attention";
  const alerts:RotationAlert[]=[];
  if(neglected[0]) alerts.push({type:"neglected",severity:neglected[0].daysSinceLastWear>=60?"high":"medium",title:`${neglected.length} fragrance${neglected.length===1?"":"s"} need rotation attention`,explanation:`${neglected[0].fragranceName} has been unused the longest at ${neglected[0].daysSinceLastWear} days.`,fragranceIds:neglected.map((x)=>x.fragranceId)});
  return {healthScore,status,nextWear:candidates[0]??null,alternatives:candidates.slice(1,4),neglected,overused,alerts,totalWears,activeRotationSize,confidence:Math.round(candidates.length?clamp(60+candidates.length*4+Math.min(totalWears,100)*0.12):35),generatedAt:now.toISOString(),modelVersion:"ROE-1.0.0"};
}
