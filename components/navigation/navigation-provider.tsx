"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";

const FAVORITES_KEY = "olfactus.navigation.favorites.v1";
const RECENTS_KEY = "olfactus.navigation.recents.v1";
const ANALYTICS_KEY = "olfactus.navigation.analytics.v1";
const SCROLL_KEY = "olfactus.navigation.scroll.v1";

interface NavigationAnalytics {
  visits: Record<string, number>;
  lastVisitedAt: Record<string, string>;
}

interface NavigationContextValue {
  favorites: string[];
  recents: string[];
  analytics: NavigationAnalytics;
  toggleFavorite: (href: string) => void;
  isFavorite: (href: string) => boolean;
  recordVisit: (href: string) => void;
  sidebarScrollTop: number;
  setSidebarScrollTop: (value: number) => void;
  hydrated: boolean;
}

const NavigationContext =
  createContext<NavigationContextValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<NavigationAnalytics>({
    visits: {},
    lastVisitedAt: {},
  });
  const [sidebarScrollTop, setSidebarScrollTopState] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFavorites(readJson(FAVORITES_KEY, []));
    setRecents(readJson(RECENTS_KEY, []));
    setAnalytics(
      readJson(ANALYTICS_KEY, {
        visits: {},
        lastVisitedAt: {},
      }),
    );
    const scroll = Number(
      window.localStorage.getItem(SCROLL_KEY) ?? "0",
    );
    setSidebarScrollTopState(Number.isFinite(scroll) ? scroll : 0);
    setHydrated(true);
  }, []);

  const recordVisit = useCallback((href: string) => {
    if (!href || href === "/") return;

    setRecents((current) => {
      const next = [href, ...current.filter((item) => item !== href)].slice(0, 8);
      window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      return next;
    });

    setAnalytics((current) => {
      const next = {
        visits: {
          ...current.visits,
          [href]: (current.visits[href] ?? 0) + 1,
        },
        lastVisitedAt: {
          ...current.lastVisitedAt,
          [href]: new Date().toISOString(),
        },
      };
      window.localStorage.setItem(ANALYTICS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    recordVisit(pathname);
  }, [hydrated, pathname, recordVisit]);

  const value = useMemo<NavigationContextValue>(
    () => ({
      favorites,
      recents,
      analytics,
      toggleFavorite(href) {
        setFavorites((current) => {
          const next = current.includes(href)
            ? current.filter((item) => item !== href)
            : [...current, href];
          window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
          return next;
        });
      },
      isFavorite: (href) => favorites.includes(href),
      recordVisit,
      sidebarScrollTop,
      setSidebarScrollTop(value) {
        setSidebarScrollTopState(value);
        window.localStorage.setItem(SCROLL_KEY, String(Math.round(value)));
      },
      hydrated,
    }),
    [analytics, favorites, hydrated, recordVisit, recents, sidebarScrollTop],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationExperience() {
  const value = useContext(NavigationContext);
  if (!value) {
    throw new Error(
      "useNavigationExperience must be used within NavigationProvider",
    );
  }
  return value;
}
