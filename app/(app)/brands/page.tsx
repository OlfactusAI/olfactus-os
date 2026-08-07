import {
  Suspense,
} from "react";

import BrandsClient from "./brands-client";

function BrandsLoading() {
  return (
    <div className="brands-page pb-12">
      <section className="brands-hero relative overflow-hidden rounded-[38px] border border-[rgba(232,200,127,.24)] p-6 sm:p-10 xl:p-14">
        <p className="brands-kicker">
          OLFACTUS Brand Intelligence
        </p>
        <h1 className="display-serif mt-5 text-[clamp(4.1rem,8vw,8.4rem)] leading-[.84] tracking-[-.065em]">
          Loading brand
          <span className="block text-[var(--gold-bright)]">
            intelligence…
          </span>
        </h1>
      </section>
    </div>
  );
}

export default function BrandsPage() {
  return (
    <Suspense
      fallback={
        <BrandsLoading />
      }
    >
      <BrandsClient />
    </Suspense>
  );
}
