import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { DEFAULT_TEMPLATES } from "../src/templates.js";
import { resolveTemplateSpec } from "../src/utils/template-resolve.js";

describe("resolveTemplateSpec", () => {
  const cwd = process.cwd();

  it("matches built-in by display name", () => {
    const r = resolveTemplateSpec("vue2-element", cwd, DEFAULT_TEMPLATES);
    expect(r).toEqual({
      kind: "remote",
      source: "github:sanjings/vue2-template",
    });
  });

  it("matches built-in by repo slug", () => {
    const r = resolveTemplateSpec("vue3-element-admin", cwd, DEFAULT_TEMPLATES);
    expect(r).toEqual({
      kind: "remote",
      source: "github:sanjings/vue3-element-admin",
    });
  });

  it("treats owner/repo as github shorthand", () => {
    const r = resolveTemplateSpec("foo/bar", cwd, DEFAULT_TEMPLATES);
    expect(r).toEqual({ kind: "remote", source: "github:foo/bar" });
  });

  it("passes through explicit provider", () => {
    const r = resolveTemplateSpec("gitlab:a/b", cwd, DEFAULT_TEMPLATES);
    expect(r).toEqual({ kind: "remote", source: "gitlab:a/b" });
  });

  it("resolves relative local path", () => {
    const r = resolveTemplateSpec("./local-tpl-fixture", cwd, DEFAULT_TEMPLATES);
    expect(r).toEqual({
      kind: "local",
      absolutePath: resolve(cwd, "local-tpl-fixture"),
    });
  });
});
