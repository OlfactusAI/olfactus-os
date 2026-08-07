"use client";

import {
  Command,
  Search,
  Star,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  searchWorkspaces,
  type WorkspaceDefinition,
} from "@/lib/navigation/workspaces";
import { useNavigationExperience } from "@/components/navigation/navigation-provider";

export function CommandPalette() {
  const router = useRouter();
  const { favorites, recents } = useNavigationExperience();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setOpen((value) => !value);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery("");
    }
  }, [open]);

  const results = useMemo(() => {
    if (query.trim()) return searchWorkspaces(query).slice(0, 10);

    const ordered = [...favorites, ...recents];
    const unique = [...new Set(ordered)];
    const preferred = unique
      .map((href) => searchWorkspaces("").find((item) => item.href === href))
      .filter(
        (
          workspace,
        ): workspace is WorkspaceDefinition =>
          Boolean(workspace),
      );

    return [
      ...preferred,
      ...searchWorkspaces("").filter(
        (workspace) => !unique.includes(workspace.href),
      ),
    ].slice(0, 10);
  }, [favorites, query, recents]);

  function navigate(href: string) {
    router.push(href);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="nexus-command-trigger"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
      >
        <Command size={14} />
        <span>Quick Open</span>
        <kbd>⌘K</kbd>
      </button>

      {open ? (
        <div
          className="nexus-command-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setOpen(false);
            }
          }}
        >
          <section
            className="nexus-command-palette"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <div className="nexus-command-search">
              <Search size={18} />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search workspaces…"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && results[0]) {
                    navigate(results[0].href);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close command palette"
              >
                <X size={16} />
              </button>
            </div>

            <div className="nexus-command-results">
              <p className="nexus-command-label">
                {query ? "Search results" : "Suggested"}
              </p>
              {results.map((workspace) => {
                const Icon = workspace.icon;
                return (
                  <button
                    type="button"
                    key={workspace.href}
                    className="nexus-command-result"
                    onClick={() => navigate(workspace.href)}
                  >
                    <span className="nexus-command-icon">
                      <Icon size={17} />
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <strong>{workspace.label}</strong>
                      <small>{workspace.description}</small>
                    </span>
                    {favorites.includes(workspace.href) ? (
                      <Star size={14} fill="currentColor" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
