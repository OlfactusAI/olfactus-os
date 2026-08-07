import type { CollectionHealthAnalysis } from "@/lib/domain/analysis";
import type { CollectionItem } from "@/lib/domain/collection";
import type { FragranceRecord } from "@/lib/domain/fragrance";

export type CollectorInsightType="rotation"|"overlap"|"health"|"purchase"|"identity"|"milestone";
export interface CollectorAssistantEvidence {
  label: string;
  value: string;
}
export interface CollectorAssistantInsight {
  id:string;
  type:CollectorInsightType;
  priority:"high"|"medium"|"low";
  title:string;
  message:string;
  action:string;
  href:string;
  fragranceId?:string;
  score:number;
  evidence:
    CollectorAssistantEvidence[];
}

export function buildCollectorAssistantInsights({collection,catalog,analysis}:{collection:CollectionItem[];catalog:FragranceRecord[];analysis:CollectionHealthAnalysis;}):CollectorAssistantInsight[]{
  const owned=collection.map(item=>({item,fragrance:catalog.find(f=>f.id===item.fragranceId)})).filter((x):x is {item:CollectionItem;fragrance:FragranceRecord}=>Boolean(x.fragrance));
  const insights:CollectorAssistantInsight[]=[];
  const neglected=[...owned].sort((a,b)=>b.item.daysSinceLastWear-a.item.daysSinceLastWear)[0];
  if(neglected?.item.daysSinceLastWear>=21) insights.push({id:`neglected:${neglected.fragrance.id}`,type:"rotation",priority:neglected.item.daysSinceLastWear>=45?"high":"medium",title:`Rediscover ${neglected.fragrance.name}`,message:`It has been ${neglected.item.daysSinceLastWear} days since its last wear.`,action:"Move it into the next rotation window.",href:`/explorer?fragrance=${neglected.fragrance.id}`,fragranceId:neglected.fragrance.id,score:Math.min(100,50+neglected.item.daysSinceLastWear),evidence:[
  {label:"Days since wear",value:String(neglected.item.daysSinceLastWear)},
  {label:"Wear count",value:String(neglected.item.wearCount)},
  {label:"Primary role",value:neglected.fragrance.roles[0] ?? "Unassigned"},
]});
  const redundancyFinding=analysis.findings.find(f=>f.type==="redundancy");
  if(redundancyFinding) insights.push({id:"overlap",type:"overlap",priority:redundancyFinding.severity==="high"?"high":"medium",title:"Overlap cluster detected",message:redundancyFinding.explanation,action:"Use the Simulator before adding another similar DNA.",href:"/simulator",score:100-analysis.dimensions.redundancy,evidence:[
  {label:"Redundancy",value:`${analysis.dimensions.redundancy}/100`},
  {label:"Diversity",value:`${analysis.dimensions.diversity}/100`},
  {label:"Recommendation",value:"Simulate before purchase"},
]});
  const weakest=Object.entries(analysis.dimensions).filter(([k])=>["diversity","rotation","seasonalBalance","roleCoverage"].includes(k)).sort((a,b)=>a[1]-b[1])[0];
  if(weakest) insights.push({id:`health:${weakest[0]}`,type:"health",priority:weakest[1]<55?"high":"medium",title:`Improve ${label(weakest[0])}`,message:`This is the weakest collection dimension at ${weakest[1]}/100.`,action:"Open Collection Health for the next best action.",href:"/collection",score:100-weakest[1],evidence:[
  {label:"Dimension",value:label(weakest[0])},
  {label:"Current score",value:`${weakest[1]}/100`},
  {label:"Collection Health",value:`${analysis.score}/100`},
]});
  const dominantFamily=[...owned.reduce((m,x)=>m.set(x.fragrance.family,(m.get(x.fragrance.family)??0)+1),new Map<string,number>()).entries()].sort((a,b)=>b[1]-a[1])[0];
  if(dominantFamily && dominantFamily[1]>=Math.max(3,Math.ceil(owned.length*.45))) insights.push({id:"identity-family",type:"identity",priority:"low",title:`Collection identity: ${dominantFamily[0]}`,message:`${dominantFamily[1]} of ${owned.length} bottles reinforce this family.`,action:"Use the graph to explore adjacent territories rather than duplicates.",href:"/graph",score:dominantFamily[1]/Math.max(1,owned.length)*100,evidence:[
  {label:"Dominant family",value:dominantFamily[0]},
  {label:"Bottle count",value:`${dominantFamily[1]} of ${owned.length}`},
  {label:"Share",value:`${Math.round(dominantFamily[1]/Math.max(1,owned.length)*100)}%`},
]});
  if(analysis.score>=80) insights.push({id:"milestone-health",type:"milestone",priority:"low",title:"Strong collection foundation",message:`Collection Health is ${analysis.score}/100 with ${analysis.calibration.confidence}% confidence.`,action:"Preserve the balance by simulating the next purchase first.",href:"/simulator",score:analysis.score,evidence:[
  {label:"Health",value:`${analysis.score}/100`},
  {label:"Confidence",value:`${analysis.calibration.confidence}%`},
  {label:"Expected range",value:`${analysis.calibration.range[0]}–${analysis.calibration.range[1]}`},
]});
  return insights.sort((a,b)=>priorityWeight(b.priority)-priorityWeight(a.priority)||b.score-a.score).slice(0,6);
}
function priorityWeight(v:CollectorAssistantInsight["priority"]){return v==="high"?3:v==="medium"?2:1}
function label(v:string){return v.replace(/([A-Z])/g," $1").replace(/^./,c=>c.toUpperCase())}
