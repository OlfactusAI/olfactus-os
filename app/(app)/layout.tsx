import { AppShell } from "@/components/layout/app-shell";
import { OlfactusOSProvider } from "@/components/os/olfactus-os-provider";
import { CollectionProvider } from "@/components/providers/collection-provider";
import { NavigationProvider } from "@/components/navigation/navigation-provider";
import { ActiveCatalogProvider } from "@/components/providers/active-catalog-provider";
import { AccountProvider } from "@/components/providers/account-provider";
import { IntelligenceEverywhereProvider } from "@/components/providers/intelligence-everywhere-provider";
import { MemoryProvider } from "@/components/providers/memory-provider";
import { PredictiveProvider } from "@/components/providers/predictive-provider";
import { CollectorIntelligenceProvider } from "@/components/providers/collector-intelligence-provider";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AccountProvider>
      <ActiveCatalogProvider>
        <CollectionProvider>
          <MemoryProvider>
            <PredictiveProvider>
              <CollectorIntelligenceProvider>
                <IntelligenceEverywhereProvider>
                <OlfactusOSProvider>
                  <NavigationProvider>
                    <AppShell>
                      {children}
                    </AppShell>
                  </NavigationProvider>
                </OlfactusOSProvider>
                </IntelligenceEverywhereProvider>
              </CollectorIntelligenceProvider>
            </PredictiveProvider>
          </MemoryProvider>
        </CollectionProvider>
      </ActiveCatalogProvider>
    </AccountProvider>
  );
}
