import { afterEach, describe, expect, it } from "vitest";

import { parseCli } from "../src/commander.js";

describe("parseCli", () => {
  const originalArgv = process.argv;
  const originalExitCode = process.exitCode;

  afterEach(() => {
    process.argv = originalArgv;
    process.exitCode = originalExitCode;
  });

  it("parses list", async () => {
    process.argv = ["node", "s-cli", "list"];
    await expect(parseCli()).resolves.toEqual({ type: "list" });
  });

  it("parses init with flags", async () => {
    process.argv = ["node", "s-cli", "init", "my-app", "-f", "-t", "uni-ts"];
    await expect(parseCli()).resolves.toEqual({
      type: "init",
      projectName: "my-app",
      options: { force: true, template: "uni-ts" },
    });
  });

  it("throws when no command provided", async () => {
    process.argv = ["node", "s-cli"];
    await expect(parseCli()).rejects.toThrow("No command provided");
  });

  it("throws Invalid command for unknown subcommand", async () => {
    process.argv = ["node", "s-cli", "nope"];
    await expect(parseCli()).rejects.toThrow("Invalid command");
    expect(process.exitCode).toBe(1);
  });
});
