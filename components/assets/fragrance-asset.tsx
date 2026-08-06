"use client";
import Image from "next/image";
import { getFragranceAsset, type FragranceAssetRecord } from "@/lib/assets/fragrance-assets";
import { cn } from "@/lib/utils";

type FragranceAssetMode = "hero" | "card" | "thumbnail";
interface Props { fragranceId: string; brand?: string; name?: string; mode?: FragranceAssetMode; className?: string; showStatus?: boolean; priority?: boolean; }

export function FragranceAsset({ fragranceId, brand, name, mode="card", className, showStatus=false, priority=false }: Props) {
  const asset = getFragranceAsset(fragranceId);
  const imagePath = mode === "hero" ? asset.assets.hero ?? asset.assets.transparent :
    mode === "thumbnail" ? asset.assets.thumbnail ?? asset.assets.transparent :
    asset.assets.transparent ?? asset.assets.thumbnail;
  return <div className={cn("fragrance-asset-root", `fragrance-asset-${mode}`, className)} data-asset-status={asset.status}>
    <div className="fragrance-asset-stage">
      <div className="fragrance-asset-glow" />
      {imagePath ? <Image src={imagePath} alt={`${brand ?? asset.brand} ${name ?? asset.name} bottle`} fill sizes={mode==="hero"?"(max-width:768px) 55vw, 360px":"(max-width:768px) 30vw, 180px"} className="fragrance-asset-image" priority={priority} /> :
        <RenderedBottle asset={asset} brand={brand ?? asset.brand} name={name ?? asset.name} />}
      <div className="fragrance-asset-floor" />
    </div>
    {showStatus ? <span className={cn("fragrance-asset-status", asset.status==="verified"&&"is-verified", asset.status==="approved"&&"is-approved")}>
      {asset.status==="verified"?"Verified asset":asset.status==="approved"?"Approved render":"OLFACTUS render"}
    </span> : null}
  </div>;
}

function RenderedBottle({ asset, brand, name }: { asset: FragranceAssetRecord; brand: string; name: string }) {
  return <div className={cn("registry-bottle", `registry-bottle-${asset.shape}`)} style={{"--asset-primary":asset.palette.primary,"--asset-accent":asset.palette.accent,"--asset-glass":asset.palette.glass} as React.CSSProperties}>
    <div className="registry-bottle-cap"/><div className="registry-bottle-neck"/>
    <div className="registry-bottle-body"><div className="registry-bottle-highlight"/><div className="registry-bottle-liquid"/>
      <div className="registry-bottle-label"><span>{brand}</span><strong>{name}</strong></div>
    </div>
  </div>;
}
