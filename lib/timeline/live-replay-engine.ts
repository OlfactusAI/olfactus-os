import type { CollectionItem } from "@/lib/domain/collection";
import type { TimelineEvent } from "@/lib/timeline/types";
export interface TimelineReplayState {timestamp:string;items:CollectionItem[];eventCount:number;health:number|null;value:number|null;}
export function replayCollectionAt(events:TimelineEvent[],timestamp:string,baseline:CollectionItem[]=[]):TimelineReplayState{
  const target=new Date(timestamp).getTime(); const byId=new Map(baseline.map(i=>[i.fragranceId,{...i}])); let health:number|null=null; let value:number|null=null; let count=0;
  for(const event of [...events].sort((a,b)=>a.timestamp.localeCompare(b.timestamp))){if(new Date(event.timestamp).getTime()>target) break; count+=1; const id=event.fragranceId;
    if(event.type==="bottle_added" && id && !byId.has(id)) byId.set(id,{fragranceId:id,wearCount:0,daysSinceLastWear:0});
    if(event.type==="bottle_removed" && id) byId.delete(id);
    if(event.type==="wear_logged" && id){const item=byId.get(id);if(item) byId.set(id,{...item,wearCount:item.wearCount+1,daysSinceLastWear:0});}
    if(event.type==="bottle_finished" && id){const item=byId.get(id);if(item) byId.set(id,{...item,fillLevelPercent:0});}
    if(event.type==="repurchased" && id){const item=byId.get(id);if(item) byId.set(id,{...item,fillLevelPercent:100});}
    if(event.snapshot) health=event.snapshot.collectionHealth;
    if(event.type==="collection_value_updated" && typeof event.metadata?.value==="number") value=event.metadata.value;
  }
  return {timestamp,items:[...byId.values()],eventCount:count,health,value};
}
export function timelineBounds(events:TimelineEvent[]){const sorted=[...events].sort((a,b)=>a.timestamp.localeCompare(b.timestamp));return {start:sorted[0]?.timestamp??new Date().toISOString(),end:sorted.at(-1)?.timestamp??new Date().toISOString()}}
