import { describe, expect, it } from "vitest";
import type { FragranceRecord } from "@/lib/domain/fragrance";
import {
  canCommitImportSession,
  commitImportSession,
  createImportSession,
  parseImportPayload,
} from "@/lib/database/import";
import { findWorkspace, searchWorkspaces } from "@/lib/navigation/workspaces";

const catalog: FragranceRecord[] = [{
  id:"atlas-edp",brand:"Example",name:"Atlas",concentration:"Eau de Parfum",
  family:"Woody",roles:["office"],seasons:{spring:70,summer:60,fall:80,winter:75},
  dna:{fresh:50,green:40,woody:80,amber:50,sweet:30,dark:40,artistic:60,formal:70},
  moods:[],performance:{longevity:75,projection:70},intelligenceStatus:"validated",
}];

describe("Import Workspace contract", () => {
  it("stages and commits a new fragrance", () => {
    const parsed = parseImportPayload({
      format:"json",
      input:JSON.stringify([{name:"Solaris",brand:"Independent House",concentration:"Extrait de Parfum",family:"Floral Amber"}]),
    });
    const session = createImportSession({incoming:parsed.records,catalog,sourceFormat:"json"});
    expect(canCommitImportSession(session)).toBe(true);
    const result = commitImportSession({session,catalog});
    expect(result.report.createdCount).toBe(1);
    expect(result.catalog).toHaveLength(2);
  });

  it("registers Import Workspace in NEXUS", () => {
    expect(findWorkspace("/import")?.label).toBe("Import Workspace");
    expect(searchWorkspaces("csv").some((item) => item.href === "/import")).toBe(true);
  });
});
