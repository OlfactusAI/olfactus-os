import type { CollectionHealthAnalysis, Finding, Recommendation } from "@/lib/domain/analysis";
import type { CollectionItem, CollectorProfile } from "@/lib/domain/collection";
import { roles, type DnaDimension, type FragranceRecord, type Season } from "@/lib/domain/fragrance";
import {
  evaluateIntelligenceEligibility,
  filterCatalogForEngine,
} from "@/lib/intelligence/readiness-gateway";
import {
  calibrateIntelligenceScore,
} from "@/lib/intelligence/confidence-calibration";
const weights = { roleCoverage:.20, seasonalBalance:.15, diversity:.20, redundancy:.15, rotation:.15, intent:.10, identity:.05 } as const;
const dnaKeys: DnaDimension[] = ["fresh","green","woody","amber","sweet","dark","artistic","formal"];
const seasons: Season[] = ["spring","summer","fall","winter"];
const clamp = (value:number) => Math.max(0, Math.min(100, value));
const average = (values:number[]) => values.length ? values.reduce((a,b)=>a+b,0)/values.length : 0;

function similarity(a:FragranceRecord,b:FragranceRecord) {
  let dot=0, ma=0, mb=0;
  for (const key of dnaKeys) { dot += a.dna[key]*b.dna[key]; ma += a.dna[key]**2; mb += b.dna[key]**2; }
  const dna = dot/(Math.sqrt(ma)*Math.sqrt(mb)||1);
  const shared = a.roles.filter(role=>b.roles.includes(role)).length;
  const union = new Set([...a.roles,...b.roles]).size;
  return dna*.65 + (shared/Math.max(1,union))*.35;
}

export function analyzeCollectionHealth(input:{ collection:CollectionItem[]; profile:CollectorProfile; catalog:FragranceRecord[] }):CollectionHealthAnalysis {
  input = { ...input, catalog: filterCatalogForEngine(input.catalog, "collection-health") };
  const owned = input.collection.map(item=>({ item, fragrance:input.catalog.find(f=>f.id===item.fragranceId) })).filter((x):x is {item:CollectionItem;fragrance:FragranceRecord}=>Boolean(x.fragrance));
  const roleScores = roles.map(role=>{ const count=owned.filter(x=>x.fragrance.roles.includes(role)).length; return {role,score:clamp(count*45+(count>1?10:0))}; });
  const roleCoverage = Math.round(average(roleScores.map(x=>x.score)));
  const seasonScores = seasons.map(season=>({ season, score:Math.round(average(owned.map(x=>x.fragrance.seasons[season]).sort((a,b)=>b-a).slice(0,3))) }));
  const seasonalBalance = Math.round(average(seasonScores.map(x=>x.score)));
  const spreads = dnaKeys.map(key=>{ const values=owned.map(x=>x.fragrance.dna[key]); return {key,score:values.length?clamp((Math.max(...values)-Math.min(...values))*1.2):0}; });
  const diversity = Math.round(clamp(average(spreads.map(x=>x.score))*.7 + new Set(owned.map(x=>x.fragrance.family)).size*12*.3));
  const overlapPairs:{names:[string,string];similarity:number}[]=[];
  for(let i=0;i<owned.length;i++) for(let j=i+1;j<owned.length;j++){ const score=similarity(owned[i].fragrance,owned[j].fragrance); if(score>=.78) overlapPairs.push({names:[owned[i].fragrance.name,owned[j].fragrance.name],similarity:Math.round(score*100)}); }
  const redundancy = owned.length === 0
    ? 0
    : Math.round(clamp(100-Math.min(55,overlapPairs.reduce((sum,p)=>sum+Math.max(5,(p.similarity-75)*1.2),0))));
  const neglected = owned.filter(x=>x.item.daysSinceLastWear>30);
  const meanWears = average(owned.map(x=>x.item.wearCount));
  const overused = owned.filter(x=>meanWears>0 && x.item.wearCount>meanWears*1.8);
  const rotation = owned.length === 0
    ? 0
    : Math.round(clamp(100-(neglected.length/owned.length)*55-(overused.length?Math.min(25,overused.length*8):0)));
  const intent = input.profile.collectionStrategy==="minimalist" ? clamp(100-Math.abs(owned.length-input.profile.targetSize)*8) : clamp(76+owned.length*2);
  const moodCounts = new Map<string,number>(); owned.forEach(x=>x.fragrance.moods.forEach(mood=>moodCounts.set(mood,(moodCounts.get(mood)??0)+1)));
  const topMoods=[...moodCounts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3);
  const identity=Math.round(clamp(55+(topMoods.reduce((sum,[,count])=>sum+count,0)/Math.max(1,owned.length*3))*70));
  const dimensions={roleCoverage,seasonalBalance,density:0,diversity,redundancy,rotation,intent:Math.round(intent),identity};
  const score=Math.round(roleCoverage*weights.roleCoverage+seasonalBalance*weights.seasonalBalance+diversity*weights.diversity+redundancy*weights.redundancy+rotation*weights.rotation+Math.round(intent)*weights.intent+identity*weights.identity);

  const findings:Finding[]=[];
  const missingRole=roleScores.find(x=>x.score<35);
  if(missingRole) findings.push({type:"missing_role",severity:"high",title:`Missing ${missingRole.role} coverage`,explanation:`No current bottle clearly serves the ${missingRole.role} role.`,confidence:.98,evidence:[missingRole]});
  const weakestSeason=[...seasonScores].sort((a,b)=>a.score-b.score)[0];
  findings.push({type:"season_gap",severity:weakestSeason.score<55?"high":"medium",title:`${weakestSeason.season} is the weakest season`,explanation:`Top-three average suitability is ${weakestSeason.score}.`,confidence:.92,evidence:[weakestSeason]});
  if(overlapPairs.length) findings.push({type:"redundancy",severity:overlapPairs.length>2?"high":"medium",title:"Functional overlap detected",explanation:`${overlapPairs.length} pair(s) combine similar DNA with similar roles.`,confidence:.88,evidence:overlapPairs});
  if(neglected.length) findings.push({type:"rotation",severity:neglected.length>1?"high":"medium",title:`${neglected.length} fragrance(s) need rotation`,explanation:"These bottles exceeded 30 days without wear.",confidence:.99,evidence:neglected.map(x=>({name:x.fragrance.name,days:x.item.daysSinceLastWear}))});
  const greenSpread=spreads.find(x=>x.key==="green")?.score??0;
  if(greenSpread<45) findings.push({type:"diversity_gap",severity:"medium",title:"Green diversity is limited",explanation:"The collection spans relatively little green territory.",confidence:.84,evidence:[{greenSpread}]});

  const recommendations:Recommendation[]=[];
  if(greenSpread<45) recommendations.push({type:"buy",priority:"high",title:"Add one green or marine-green fragrance",reason:"This expands warm-weather breadth without repeating the current amber axis.",projectedImpact:4,targetFragranceId:"un-air",confidence:.91});
  if(neglected[0]) recommendations.push({type:"wear",priority:"high",title:`Wear ${neglected[0].fragrance.name} next`,reason:`It has not been worn in ${neglected[0].item.daysSinceLastWear} days.`,projectedImpact:2,targetFragranceId:neglected[0].fragrance.id,confidence:.99});
  if(overlapPairs.length) recommendations.push({type:"avoid",priority:"medium",title:"Avoid another fragrance in the overlap cluster",reason:"The next purchase should add a new role or DNA direction.",projectedImpact:0,confidence:.87});

  const strongestSeason=[...seasonScores].sort((a,b)=>b.score-a.score)[0];
  const validDimensions={roleCoverage,seasonalBalance,diversity,redundancy,rotation,intent:Math.round(intent),identity};
  const eligibility =
    owned.length
      ? owned
          .map((item) =>
            evaluateIntelligenceEligibility(
              item.fragrance,
            ),
          )
          .sort(
            (a, b) =>
              a.confidence -
              b.confidence,
          )[0]
      : {
          readiness:
            "partial" as const,
          confidence: 60,
          allowedEngines: [
            "collection-health" as const,
          ],
          restrictedEngines: [],
          warnings: [
            "The collection contains no eligible fragrances.",
          ],
          missingFields: [
            "collection",
          ],
        };
  const calibration =
    calibrateIntelligenceScore({
      rawScore: score,
      eligibility,
      evidenceSignals:
        Object.entries(
          validDimensions,
        ).map(
          ([id, strength]) => ({
            id,
            strength,
            source:
              "derived" as const,
          }),
        ),
      warnings:
        owned.length < 3
          ? [
              "Collection-level confidence is limited by a small sample.",
            ]
          : [],
    });
  return { analysisType:"collection_health", score, calibration, status:score>=88?"Excellent":score>=75?"Strong Foundation":score>=60?"Developing":"Needs Attention", confidence:calibration.confidence, summary:`Strongest in ${strongestSeason.season}; identity centers on ${topMoods.map(([m])=>m).join(", ") || "versatility"}.`, dimensions:validDimensions, findings, recommendations, modelVersion:"CHE-1.0.0" };
}
