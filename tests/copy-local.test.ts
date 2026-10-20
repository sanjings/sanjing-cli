import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { copyLocalTemplate } from "../src/create.js";

describe("copyLocalTemplate", () => {
  let root: string | undefined;

  afterEach(() => {
    if (root) {
      rmSync(root, { recursive: true, force: true });
      root = undefined;
    }
  });

  it("copies files but skips node_modules and .git", async () => {
    root = mkdtempSync(join(tmpdir(), "s-cli-copy-"));
    const src = join(root, "tpl");
    const dest = join(root, "out");

    mkdirSync(join(src, "src"), { recursive: true });
    mkdirSync(join(src, "node_modules", "left-pad"), { recursive: true });
    mkdirSync(join(src, ".git"), { recursive: true });
    writeFileSync(join(src, "package.json"), JSON.stringify({ name: "tpl" }), "utf8");
    writeFileSync(join(src, "src", "main.ts"), "export {};\n", "utf8");
    writeFileSync(join(src, "node_modules", "left-pad", "index.js"), "module.exports = 1;\n", "utf8");
    writeFileSync(join(src, ".git", "config"), "[core]\n", "utf8");

    await copyLocalTemplate(src, dest);

    expect(readFileSync(join(dest, "package.json"), "utf8")).toContain("tpl");
    expect(readFileSync(join(dest, "src", "main.ts"), "utf8")).toBe("export {};\n");
    expect(existsSync(join(dest, "node_modules"))).toBe(false);
    expect(existsSync(join(dest, ".git"))).toBe(false);
  });

  it("rejects non-directory sources", async () => {
    root = mkdtempSync(join(tmpdir(), "s-cli-copy-file-"));
    const file = join(root, "not-a-dir.txt");
    writeFileSync(file, "x", "utf8");
    await expect(copyLocalTemplate(file, join(root, "out"))).rejects.toThrow(
      /not a directory/i,
    );
  });
});
