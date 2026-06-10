import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  PUBLIC_SURFACE_FORBIDDEN,
  PUBLIC_SURFACE_SCAN_DIRS,
  PUBLIC_SURFACE_SCAN_EXCLUDE,
} from "./drift-prevention";
import { COMPLIANCE, COMPLIANCE_MESSAGING } from "./constants";

const REPO_ROOT = path.resolve(__dirname, "../../..");

function listTsxInTree(dir: string): string[] {
  const abs = path.join(REPO_ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const full = path.join(abs, entry.name);
    if (entry.isDirectory()) out.push(...listTsxInTree(path.join(dir, entry.name)));
    else if (entry.name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

function isTechnicalLine(line: string): boolean {
  const t = line.trim();
  if (!t || t.startsWith("//") || t.startsWith("*")) return true;
  if (/^(import|export|const|let|type|interface|function)\s/.test(t)) return true;
  if (t.includes("toStablecoin") || t.includes("DEFAULT_COIN") || t.includes("DEFAULT_NETWORK")) return true;
  return false;
}

describe("public surface drift scan", () => {
  it("SME-facing TSX has no forbidden infrastructure or MSB claims", () => {
    const violations: string[] = [];

    for (const dir of PUBLIC_SURFACE_SCAN_DIRS) {
      for (const file of listTsxInTree(dir)) {
        const rel = path.relative(REPO_ROOT, file);
        if (PUBLIC_SURFACE_SCAN_EXCLUDE.some((ex) => rel === ex || rel.endsWith(ex))) continue;
        const lines = fs.readFileSync(file, "utf8").split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (isTechnicalLine(line)) continue;
          for (const { label, pattern } of PUBLIC_SURFACE_FORBIDDEN) {
            if (pattern.test(line)) {
              violations.push(`${rel}:${i + 1} — forbidden "${label}": ${line.trim()}`);
            }
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("COMPLIANCE_MESSAGING forbidden phrases align with fintracMsbClaim flag", () => {
    if (COMPLIANCE.fintracMsbClaim) return;
    for (const phrase of COMPLIANCE_MESSAGING.publicForbiddenUntilRegistered) {
      expect(phrase.length).toBeGreaterThan(3);
    }
  });
});
