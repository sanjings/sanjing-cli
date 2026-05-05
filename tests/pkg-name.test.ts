import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { rewritePackageJsonName } from "../src/utils/pkg-name.js";

describe("rewritePackageJsonName", () => {
  let dir: string | undefined;

  afterEach(() => {
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
      dir = undefined;
    }
  });

  it("updates name field when package.json exists", () => {
    dir = mkdtempSync(join(tmpdir(), "s-cli-pkg-"));
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({ name: "old", version: "0.0.0" }),
      "utf8",
    );

    expect(rewritePackageJsonName(dir, "new-app")).toBe(true);

    const next = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as {
      name: string;
    };
    expect(next.name).toBe("new-app");
  });

  it("returns false when package.json missing", () => {
    dir = mkdtempSync(join(tmpdir(), "s-cli-pkg-"));
    expect(rewritePackageJsonName(dir, "x")).toBe(false);
  });
});
