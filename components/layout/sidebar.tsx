"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Beaker,
  ChevronDown,
  ChevronRight,
  Command,
  Search,
  Star,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  searchWorkspaces,
  workspaceSections,
  workspaces,
  type WorkspaceDefinition,
  type WorkspaceSection,
} from "@/lib/navigation/workspaces";
import { useNavigationExperience } from "@/components/navigation/navigation-provider";

export function Sidebar() {
  const pathname = usePathname();
  const {
    favorites,
    recents,
    analytics,
    toggleFavorite,
    isFavorite,
    sidebarScrollTop,
    setSidebarScrollTop,
  } = useNavigationExperience();

  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<
    Record<WorkspaceSection, boolean>
  >({
    Dashboard: false,
    Knowledge: false,
    Analytics: false,
    Account: false,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollTop = sidebarScrollTop;
  }, [sidebarScrollTop]);

  const filtered = useMemo(
    () => searchWorkspaces(query),
    [query],
  );

  const favoriteWorkspaces = favorites
    .map((href) => workspaces.find((item) => item.href === href))
    .filter(
      (
        workspace,
      ): workspace is WorkspaceDefinition =>
        Boolean(workspace),
    );

  const recentWorkspaces = recents
    .slice(0, 4)
    .map((href) => workspaces.find((item) => item.href === href))
    .filter(
      (
        workspace,
      ): workspace is WorkspaceDefinition =>
        Boolean(workspace),
    );

  const mostUsed = [...workspaces]
    .sort(
      (a, b) =>
        (analytics.visits[b.href] ?? 0) -
        (analytics.visits[a.href] ?? 0),
    )
    .slice(0, 3)
    .filter((workspace) => (analytics.visits[workspace.href] ?? 0) > 0);

  return (
    <aside className="nexus-sidebar hidden lg:flex">
      <header className="nexus-sidebar-header">
        <Link href="/today" className="nexus-brand">
          <span className="display-serif">OLFACTUS</span>
          <small>Neural Operating System</small>
        </Link>

        <label className="nexus-workspace-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search workspaces…"
          />
          <kbd>⌘K</kbd>
        </label>
      </header>

      <div
        ref={scrollRef}
        className="nexus-sidebar-scroll"
        onScroll={(event) =>
          setSidebarScrollTop(event.currentTarget.scrollTop)
        }
      >
        {favoriteWorkspaces.length ? (
          <NavigationGroup
            title="Favorites"
            workspaces={favoriteWorkspaces}
            pathname={pathname}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
          />
        ) : null}

        {recentWorkspaces.length ? (
          <NavigationGroup
            title="Recent"
            workspaces={recentWorkspaces}
            pathname={pathname}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
            compact
          />
        ) : null}

        {mostUsed.length ? (
          <NavigationGroup
            title="Most Used"
            workspaces={mostUsed}
            pathname={pathname}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
            compact
          />
        ) : null}

        {workspaceSections.map((section) => {
          const sectionWorkspaces = filtered.filter(
            (workspace) => workspace.section === section,
          );

          if (!sectionWorkspaces.length) return null;

          return (
            <section key={section} className="nexus-nav-section">
              <button
                type="button"
                className="nexus-nav-section-header"
                onClick={() =>
                  setCollapsed((current) => ({
                    ...current,
                    [section]: !current[section],
                  }))
                }
                aria-expanded={!collapsed[section]}
              >
                <span>{section}</span>
                {collapsed[section] ? (
                  <ChevronRight size={13} />
                ) : (
                  <ChevronDown size={13} />
                )}
              </button>

              {!collapsed[section] || query ? (
                <div className="nexus-nav-links">
                  {sectionWorkspaces.map((workspace) => (
                    <WorkspaceLink
                      key={workspace.href}
                      workspace={workspace}
                      active={
                        pathname === workspace.href ||
                        pathname.startsWith(`${workspace.href}/`)
                      }
                      favorite={isFavorite(workspace.href)}
                      onToggleFavorite={() =>
                        toggleFavorite(workspace.href)
                      }
                    />
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}

        {!filtered.length ? (
          <p className="nexus-nav-empty">
            No workspace matches “{query}”.
          </p>
        ) : null}
      </div>

      <footer className="nexus-sidebar-footer">
        <div className="nexus-system-status">
          <span>
            <Beaker size={13} />
            Neural Core online
          </span>
          <span>171 engines synchronized</span>
        </div>
        <p>OLFACTUS OS v2.0.0c-1 · Universal Search Core</p>
      </footer>
    </aside>
  );
}

function NavigationGroup({
  title,
  workspaces,
  pathname,
  isFavorite,
  toggleFavorite,
  compact = false,
}: {
  title: string;
  workspaces: WorkspaceDefinition[];
  pathname: string;
  isFavorite: (href: string) => boolean;
  toggleFavorite: (href: string) => void;
  compact?: boolean;
}) {
  return (
    <section className="nexus-nav-section">
      <p className="nexus-nav-static-title">{title}</p>
      <div className="nexus-nav-links">
        {workspaces.map((workspace) => (
          <WorkspaceLink
            key={`${title}-${workspace.href}`}
            workspace={workspace}
            active={
              pathname === workspace.href ||
              pathname.startsWith(`${workspace.href}/`)
            }
            favorite={isFavorite(workspace.href)}
            onToggleFavorite={() => toggleFavorite(workspace.href)}
            compact={compact}
          />
        ))}
      </div>
    </section>
  );
}

function WorkspaceLink({
  workspace,
  active,
  favorite,
  onToggleFavorite,
  compact = false,
}: {
  workspace: WorkspaceDefinition;
  active: boolean;
  favorite: boolean;
  onToggleFavorite: () => void;
  compact?: boolean;
}) {
  const Icon = workspace.icon;

  return (
    <div className={`nexus-workspace-row ${active ? "is-active" : ""}`}>
      <Link
        href={workspace.href}
        className="nexus-workspace-link"
        title={workspace.description}
      >
        <Icon size={compact ? 15 : 17} />
        <span>{workspace.label}</span>
      </Link>
      <button
        type="button"
        className="nexus-favorite-button"
        onClick={onToggleFavorite}
        aria-label={
          favorite
            ? `Remove ${workspace.label} from favorites`
            : `Add ${workspace.label} to favorites`
        }
      >
        <Star size={13} fill={favorite ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
