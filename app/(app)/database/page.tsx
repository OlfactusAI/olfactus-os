import {
  Suspense,
} from "react";

import DatabaseClient from "./database-client";

function DatabaseLoading() {
  return (
    <div className="pb-12">
      <section className="layer3-hero">
        <div>
          <p className="layer3-kicker">
            OLFACTUS Global Database
          </p>
          <h1 className="display-serif mt-4 text-[clamp(3.8rem,7vw,7rem)] leading-[.88]">
            Loading database intelligence…
          </h1>
        </div>
      </section>
    </div>
  );
}

export default function DatabasePage() {
  return (
    <Suspense
      fallback={
        <DatabaseLoading />
      }
    >
      <DatabaseClient />
    </Suspense>
  );
}
