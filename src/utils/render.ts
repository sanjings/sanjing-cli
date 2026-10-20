/**
 * 简易占位符替换：在生成目录里扫描文本文件，把 `{{projectName}}` 等换成实际值。
 *
 * 设计取舍：
 * - 不用 Handlebars/ejs：依赖少、行为直观；代价是不能写逻辑分支。
 * - 按扩展名 / 点文件白名单过滤：避免把图片、字体当 UTF-8 读坏。
 * - 读写并行：收集路径后 Promise.all，缩短大模板的渲染时间。
 *
 * 若模板里故意包含字面量 `{{projectName}}` 且不应替换，当前实现无法区分，需改模板。
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { SKIP_DIR_NAMES } from "./skip-names.js";

/** 认为是「文本」的扩展名；不在表里的文件一律跳过（点文件另有规则） */
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
  ".txt",
  ".toml",
  ".svg",
  ".xml",
]);

/**
 * 无标准扩展名、但仍应按文本替换的点文件（及 `.env*` 族由 isTextFile 单独判断）。
 */
const DOTFILE_TEXT_NAMES = new Set([
  ".gitignore",
  ".npmrc",
  ".editorconfig",
  ".prettierignore",
  ".prettierrc",
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

  await Promise.all(files.map((file) => renderOneFile(file, map)));
}

async function renderOneFile(file: string, map: Record<string, string>): Promise<void> {
  let content: string;
  try {
    content = await readFile(file, "utf8");
  } catch {
    return;
  }

  let next = content;
  for (const [key, value] of Object.entries(map)) {
    next = next.replaceAll(`{{${key}}}`, value);
  }

  if (next !== content) {
    await writeFile(file, next, "utf8");
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

  const subdirs: string[] = [];

  for (const entry of entries) {
    if (SKIP_DIR_NAMES.has(entry.name)) continue;

    const full = join(current, entry.name);
    if (entry.isDirectory()) {
      subdirs.push(full);
    } else if (entry.isFile() && isTextFile(entry.name)) {
      acc.push(full);
    }
  }

  await Promise.all(subdirs.map((dir) => walk(dir, acc)));
}

/** 扩展名白名单，或 `.env*` / 常见点文件 */
export function isTextFile(filename: string): boolean {
  if (TEXT_EXT.has(getExt(filename))) return true;
  if (filename.startsWith(".env")) return true;
  if (DOTFILE_TEXT_NAMES.has(filename)) return true;
  return false;
}

function getExt(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot <= 0) return "";
  return filename.slice(dot).toLowerCase();
}
