import { AppShell } from "@/components/layout/app-shell";
import { OlfactusOSProvider } from "@/components/os/olfactus-os-provider";
import { CollectionProvider } from "@/components/providers/collection-provider";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CollectionProvider>
      <OlfactusOSProvider>
        <AppShell>{children}</AppShell>
      </OlfactusOSProvider>
    </CollectionProvider>
  );
}
