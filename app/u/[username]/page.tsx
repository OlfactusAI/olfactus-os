import {
  notFound,
} from "next/navigation";

export default async function PublicProfilePage({
  params,
}: {
  params:
    Promise<{
      username: string;
    }>;
}) {
  const {
    username,
  } =
    await params;

  // Public profiles are opt-in. No profile is created automatically.
  if (
    !username ||
    username ===
      "private"
  ) {
    notFound();
  }

  return (
    <main className="public-share-shell">
      <header className="public-share-header">
        <div>
          <p className="layer3-kicker">
            Optional Public Profile
          </p>
          <h1 className="display-serif">
            @{username}
          </h1>
          <p className="mt-4 text-[var(--muted)]">
            This profile foundation remains empty until the account owner explicitly publishes selected information.
          </p>
        </div>
      </header>
    </main>
  );
}
