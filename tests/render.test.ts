import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { isTextFile, renderTemplatePlaceholders } from "../src/utils/render.js";

describe("isTextFile", () => {
  it("accepts common text extensions", () => {
    expect(isTextFile("readme.md")).toBe(true);
    expect(isTextFile("app.vue")).toBe(true);
    expect(isTextFile("config.toml")).toBe(true);
    expect(isTextFile("note.txt")).toBe(true);
  });

  it("accepts .env family and known dotfiles", () => {
    expect(isTextFile(".env")).toBe(true);
    expect(isTextFile(".env.example")).toBe(true);
    expect(isTextFile(".gitignore")).toBe(true);
    expect(isTextFile(".npmrc")).toBe(true);
  });

  it("rejects binary-ish extensions", () => {
    expect(isTextFile("logo.png")).toBe(false);
    expect(isTextFile("font.woff2")).toBe(false);
  });
});

describe("renderTemplatePlaceholders", () => {
  let dir: string | undefined;

  afterEach(() => {
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
      dir = undefined;
    }
  });

  it("replaces placeholders in text files including .env.example", async () => {
    dir = mkdtempSync(join(tmpdir(), "s-cli-render-"));
    writeFileSync(join(dir, "README.md"), "# {{projectName}} by {{author}} ({{year}})\n", "utf8");
    writeFileSync(join(dir, ".env.example"), "APP_NAME={{projectName}}\n", "utf8");
    writeFileSync(join(dir, "plain.txt"), "hello {{projectName}}\n", "utf8");

    await renderTemplatePlaceholders(dir, {
      projectName: "demo-app",
      author: "alice",
      year: "2026",
    });

    expect(readFileSync(join(dir, "README.md"), "utf8")).toBe("# demo-app by alice (2026)\n");
    expect(readFileSync(join(dir, ".env.example"), "utf8")).toBe("APP_NAME=demo-app\n");
    expect(readFileSync(join(dir, "plain.txt"), "utf8")).toBe("hello demo-app\n");
  });

  it("skips node_modules and does not rewrite files there", async () => {
    dir = mkdtempSync(join(tmpdir(), "s-cli-render-skip-"));
    const nm = join(dir, "node_modules", "pkg");
    mkdirSync(nm, { recursive: true });
    writeFileSync(join(nm, "index.js"), "export const n = '{{projectName}}';\n", "utf8");
    writeFileSync(join(dir, "app.js"), "const n = '{{projectName}}';\n", "utf8");

    await renderTemplatePlaceholders(dir, {
      projectName: "demo-app",
      author: "alice",
      year: "2026",
    });

    expect(readFileSync(join(dir, "app.js"), "utf8")).toBe("const n = 'demo-app';\n");
    expect(readFileSync(join(nm, "index.js"), "utf8")).toBe("export const n = '{{projectName}}';\n");
  });
});
