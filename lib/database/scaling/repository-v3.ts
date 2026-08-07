import type { FragranceRecord } from "@/lib/domain/fragrance";
export interface ProvenanceRecord {entityId:string;sourceId:string;sourceLabel:string;retrievedAt:string;confidence:number;license?:string;}
export interface DatabaseBatch {id:string;records:FragranceRecord[];provenance:ProvenanceRecord[];createdAt:string;status:"queued"|"validated"|"committed"|"rejected";}
export interface RepositoryPage {records:FragranceRecord[];page:number;pageSize:number;total:number;pageCount:number;}
export class ScalableFragranceRepository {
 private records=new Map<string,FragranceRecord>(); private provenance=new Map<string,ProvenanceRecord[]>(); private batches=new Map<string,DatabaseBatch>();
 constructor(seed:FragranceRecord[]=[]){this.upsertMany(seed,[])}
 upsertMany(records:FragranceRecord[],provenance:ProvenanceRecord[]){for(const r of records)this.records.set(r.id,r);for(const p of provenance)this.provenance.set(p.entityId,[...(this.provenance.get(p.entityId)??[]),p])}
 queueBatch(batch:DatabaseBatch){this.batches.set(batch.id,batch);return batch}
 commitBatch(id:string){const batch=this.batches.get(id);if(!batch)throw new Error(`Unknown batch: ${id}`);this.upsertMany(batch.records,batch.provenance);const committed={...batch,status:"committed" as const};this.batches.set(id,committed);return committed}
 page({page=1,pageSize=100,query=""}:{page?:number;pageSize?:number;query?:string}={}):RepositoryPage{const q=query.trim().toLowerCase();const all=[...this.records.values()].filter(r=>!q||`${r.brand} ${r.name} ${r.family}`.toLowerCase().includes(q)).sort((a,b)=>a.brand.localeCompare(b.brand)||a.name.localeCompare(b.name));const start=(Math.max(1,page)-1)*pageSize;return {records:all.slice(start,start+pageSize),page:Math.max(1,page),pageSize,total:all.length,pageCount:Math.max(1,Math.ceil(all.length/pageSize))}}
 get(id:string){return this.records.get(id)??null} getProvenance(id:string){return this.provenance.get(id)??[]} stats(){const records=[...this.records.values()];return {records:records.length,brands:new Set(records.map(r=>r.brand)).size,perfumers:new Set(records.flatMap(r=>r.perfumers??[])).size,notes:new Set(records.flatMap(r=>r.notes?[...r.notes.top,...r.notes.heart,...r.notes.base]:[])).size,batches:this.batches.size,provenanceRecords:[...this.provenance.values()].reduce((s,v)=>s+v.length,0)}}
}
export function estimateRepositoryCapacity(recordCount:number){return {recordCount,indexShards:Math.max(1,Math.ceil(recordCount/5000)),recommendedPageSize:recordCount>25000?50:100,incrementalLoading:recordCount>5000,estimatedMemoryMb:Math.round(recordCount*.006)}}
