"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  findWorkspace,
} from "@/lib/navigation/workspaces";

const sectionHref: Record<string, string> = {
  Dashboard: "/today",
  Knowledge: "/explorer",
  Analytics: "/timeline",
  Account: "/profile",
};

export function BreadcrumbBar() {
  const pathname = usePathname();
  const workspace = findWorkspace(pathname);

  if (!workspace) return null;

  return (
    <nav
      className="nexus-breadcrumb"
      aria-label="Breadcrumb"
    >
      <Link href="/today" aria-label="Home">
        <Home size={13} />
      </Link>
      <ChevronRight size={12} />
      <Link href={sectionHref[workspace.section]}>
        {workspace.section}
      </Link>
      <ChevronRight size={12} />
      <span>{workspace.label}</span>
    </nav>
  );
}
