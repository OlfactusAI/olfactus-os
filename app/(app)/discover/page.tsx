import { FragranceCard } from "@/components/features/fragrance-card";
import { PageHeader } from "@/components/features/page-header";
import { fragrances } from "@/lib/data/fragrances";
export default function DiscoverPage(){return <><PageHeader eyebrow="Curated exploration" title="Discover" description="Explore fragrances that add new value, not merely popularity."/><section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{fragrances.slice(6).map(fragrance=><FragranceCard key={fragrance.id} fragrance={fragrance}/>)}</section></>}
