import {
  Suspense,
} from "react";

import PerfumersClient from "./perfumers-client";

function PerfumersLoading() {
  return (
    <div className="pb-12">
      <section className="layer3-hero">
        <div>
          <p className="layer3-kicker">
            OLFACTUS Perfumer Intelligence
          </p>
          <h1 className="display-serif mt-4 text-[clamp(3.8rem,7vw,7rem)] leading-[.88]">
            Loading perfumer intelligence…
          </h1>
        </div>
      </section>
    </div>
  );
}

export default function PerfumersPage() {
  return (
    <Suspense
      fallback={
        <PerfumersLoading />
      }
    >
      <PerfumersClient />
    </Suspense>
  );
}
