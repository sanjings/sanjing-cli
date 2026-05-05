/**
 * 生成完成后把 package.json 里的 `"name"` 改成用户输入的项目名。
 *
 * 行为说明：
 * - 模板里没有 package.json：直接返回 false，不做任何事（例如某些纯静态模板）。
 * - JSON 损坏或不是对象：返回 false，避免把坏文件写得更坏。
 * - 写入时用 `JSON.stringify(..., null, 2)`：会重排 key 顺序；对脚手架可接受。
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function rewritePackageJsonName(projectRoot: string, name: string): boolean {
  const pkgPath = join(projectRoot, "package.json");
  if (!existsSync(pkgPath)) {
    return false;
  }

  let parsed: { name?: string } & Record<string, unknown>;
  try {
    parsed = JSON.parse(readFileSync(pkgPath, "utf8")) as typeof parsed;
  } catch {
    return false;
  }

  parsed.name = name;
  writeFileSync(pkgPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  return true;
}
