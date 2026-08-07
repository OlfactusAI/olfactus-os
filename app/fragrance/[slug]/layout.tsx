import {
  ActiveCatalogProvider,
} from "@/components/providers/active-catalog-provider";

export default function PublicCatalogLayout({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <ActiveCatalogProvider>
      {children}
    </ActiveCatalogProvider>
  );
}
