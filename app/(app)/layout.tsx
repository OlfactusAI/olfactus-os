import { AppShell } from "@/components/layout/app-shell";
import { CollectionProvider } from "@/components/providers/collection-provider";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CollectionProvider>
      <AppShell>{children}</AppShell>
    </CollectionProvider>
  );
}
