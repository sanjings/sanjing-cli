/**
 * 简易占位符替换：在生成目录里扫描文本文件，把 `{{projectName}}` 等换成实际值。
 *
 * 设计取舍：
 * - 不用 Handlebars/ejs：依赖少、行为直观；代价是不能写逻辑分支。
 * - 按扩展名白名单过滤：避免把图片、字体当 UTF-8 读坏。
 * - 动态 import fs/promises：让本文件顶层 lighter（次要），主要逻辑仍是遍历。
 *
 * 若模板里故意包含字面量 `{{projectName}}` 且不应替换，当前实现无法区分，需改模板。
 */
import { readdir } from "node:fs/promises";
import { join } from "node:path";

/** 不解压 / 不遍历的目录：依赖安装产物与版本库 */
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", "coverage"]);

/** 认为是「文本」的扩展名；不在表里的文件一律跳过 */
const TEXT_EXT = new Set([
  ".md",
  ".html",
  ".htm",
  ".vue",
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".cjs",
  ".json",
  ".css",
  ".scss",
  ".less",
  ".yaml",
  ".yml",
]);

export interface RenderVars {
  projectName: string;
  author: string;
  year: string;
}

export async function renderTemplatePlaceholders(rootDir: string, vars: RenderVars): Promise<void> {
  const files = await collectTextFiles(rootDir);
  const map: Record<string, string> = {
    projectName: vars.projectName,
    author: vars.author,
    year: vars.year,
  };

  const { readFile, writeFile } = await import("node:fs/promises");

  for (const file of files) {
    let content: string;
    try {
      content = await readFile(file, "utf8");
    } catch {
      continue;
    }

    let next = content;
    for (const [key, value] of Object.entries(map)) {
      next = next.replaceAll(`{{${key}}}`, value);
    }

    if (next !== content) {
      await writeFile(file, next, "utf8");
    }
  }
}

async function collectTextFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  await walk(dir, out);
  return out;
}

/** 深度优先遍历；遇到权限错误目录直接跳过该分支 */
async function walk(current: string, acc: string[]): Promise<void> {
  let entries;
  try {
    entries = await readdir(current, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    if (SKIP_DIRS.has(entry.name)) continue;

    const full = join(current, entry.name);
    if (entry.isDirectory()) {
      await walk(full, acc);
    } else if (entry.isFile()) {
      const ext = getExt(entry.name);
      if (TEXT_EXT.has(ext)) {
        acc.push(full);
      }
    }
  }
}

function getExt(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot <= 0) return "";
  return filename.slice(dot).toLowerCase();
}
