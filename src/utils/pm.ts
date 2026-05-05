/**
 * 推断「当前这条命令是在哪种包管理器环境里跑出来的」，只用于最后几行提示文案。
 *
 * 不用于执行安装（脚手架不负责替你跑 pnpm install），因此不做 spawn、也不缓存结果。
 */
export type PackageManagerName = "pnpm" | "yarn" | "npm";

/**
 * 读 `npm_config_user_agent`：npm / yarn / pnpm 在调用子进程时都会注入。
 *
 * 为什么默认回落到 npm：纯 node dist/index.js、或未设置 UA 时，至少给出一套通用命令，
 * 而不是瞎猜 pnpm。
 */
export function detectPackageManager(): PackageManagerName {
  const ua = process.env.npm_config_user_agent ?? "";
  if (ua.startsWith("pnpm")) return "pnpm";
  if (ua.startsWith("yarn")) return "yarn";
  return "npm";
}

/** 与 Yarn v1 习惯一致：`yarn` 不带 install 子命令也能装依赖 */
export function formatInstallCommand(pm: PackageManagerName): string {
  if (pm === "pnpm") return "pnpm install";
  if (pm === "yarn") return "yarn";
  return "npm install";
}

/**
 * 假定模板使用 `dev` 脚本；若模板实际是 `serve` 等，用户需自己改命令。
 */
export function formatDevCommand(pm: PackageManagerName): string {
  if (pm === "pnpm") return "pnpm dev";
  if (pm === "yarn") return "yarn dev";
  return "npm run dev";
}
