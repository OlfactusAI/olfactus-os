"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  workspaceSections,
  workspaces,
  type WorkspaceDefinition,
} from "@/lib/navigation/workspaces";

const primaryHrefs = [
  "/today",
  "/collection",
  "/explorer",
  "/deal-lab",
  "/profile",
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const primary = primaryHrefs
    .map((href) => workspaces.find((item) => item.href === href))
    .filter(
      (
        workspace,
      ): workspace is WorkspaceDefinition =>
        Boolean(workspace),
    );

  return (
    <>
      <nav className="nexus-mobile-dock lg:hidden">
        {primary.map((workspace) => {
          const Icon = workspace.icon;
          const active = pathname === workspace.href;

          return (
            <Link
              key={workspace.href}
              href={workspace.href}
              className={active ? "is-active" : ""}
            >
              <Icon size={18} />
              <span>{workspace.shortLabel}</span>
            </Link>
          );
        })}
        <button type="button" onClick={() => setOpen(true)}>
          <Menu size={18} />
          <span>More</span>
        </button>
      </nav>

      {open ? (
        <div className="nexus-mobile-backdrop lg:hidden">
          <aside className="nexus-mobile-drawer">
            <header>
              <div>
                <p className="display-serif">OLFACTUS</p>
                <span>All Workspaces</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
              >
                <X size={19} />
              </button>
            </header>

            <div className="nexus-mobile-search">
              <Search size={15} />
              <span>Use ⌘K or Ctrl+K for quick search</span>
            </div>

            <div className="nexus-mobile-scroll">
              {workspaceSections.map((section) => (
                <section key={section}>
                  <p>{section}</p>
                  <div>
                    {workspaces
                      .filter((workspace) => workspace.section === section)
                      .map((workspace) => {
                        const Icon = workspace.icon;
                        return (
                          <Link
                            key={workspace.href}
                            href={workspace.href}
                            onClick={() => setOpen(false)}
                            className={
                              pathname === workspace.href ? "is-active" : ""
                            }
                          >
                            <Icon size={17} />
                            <span>{workspace.label}</span>
                          </Link>
                        );
                      })}
                  </div>
                </section>
              ))}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
