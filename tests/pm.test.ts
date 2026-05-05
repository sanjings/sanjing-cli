import { afterEach, describe, expect, it, vi } from "vitest";

import {
  detectPackageManager,
  formatDevCommand,
  formatInstallCommand,
} from "../src/utils/pm.js";

describe("detectPackageManager", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads pnpm from user agent", () => {
    vi.stubEnv("npm_config_user_agent", "pnpm/9.0.0 npm/? node/v20.0.0 win32 x64");
    expect(detectPackageManager()).toBe("pnpm");
  });

  it("reads yarn from user agent", () => {
    vi.stubEnv("npm_config_user_agent", "yarn/1.22 npm/? node/v20");
    expect(detectPackageManager()).toBe("yarn");
  });

  it("falls back to npm", () => {
    vi.stubEnv("npm_config_user_agent", "npm/10.0.0 node/v20");
    expect(detectPackageManager()).toBe("npm");
  });
});

describe("formatInstallCommand", () => {
  it("maps each pm", () => {
    expect(formatInstallCommand("pnpm")).toBe("pnpm install");
    expect(formatInstallCommand("yarn")).toBe("yarn");
    expect(formatInstallCommand("npm")).toBe("npm install");
  });
});

describe("formatDevCommand", () => {
  it("maps each pm", () => {
    expect(formatDevCommand("pnpm")).toBe("pnpm dev");
    expect(formatDevCommand("yarn")).toBe("yarn dev");
    expect(formatDevCommand("npm")).toBe("npm run dev");
  });
});
