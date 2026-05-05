/**
 * 把用户输入的 `-t` 字符串变成两类结果之一：
 * - local：本机目录，走 fs.cp；
 * - remote：giget 认识的「模板源」字符串（如 `github:user/repo`）。
 *
 * 典型输入 → 结果对照（便于排查「为什么拉错仓库」）：
 * - `vue3-element-admin`：命中内置表 → `github:sanjings/vue3-element-admin`
 * - `foo/bar`：视为 GitHub 简写 → `github:foo/bar`
 * - `gitlab:org/repo`：含冒号前缀 → 原样交给 giget
 * - `./my-tpl` / `D:\tpl`：本地路径 → { kind: 'local', absolutePath }
 */
import { isAbsolute, resolve } from "node:path";

import type { BuiltinTemplate } from "../templates.js";

export type ResolvedTemplate = { kind: "local"; absolutePath: string } | { kind: "remote"; source: string };

/** 匹配 `owner/repo` 或带 ref 的 `owner/repo#tag`；不加协议前缀 */
const OWNER_REPO = /^[\w.-]+\/[\w.-]+(?:#[\w.-]+)?$/;

/**
 * @param raw - 来自 `-t` 或交互选择返回的 slug
 * @param cwd - 解析相对路径时的基准目录（一般为 process.cwd()）
 * @param builtins - 当前内置模板列表，便于测试注入假数据
 */
export function resolveTemplateSpec(raw: string, cwd: string, builtins: BuiltinTemplate[]): ResolvedTemplate {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("Template value is empty");
  }

  if (isLocalTemplatePath(trimmed)) {
    return { kind: "local", absolutePath: resolve(cwd, trimmed) };
  }

  const builtin = builtins.find((item) => item.name === trimmed || item.value === trimmed);
  if (builtin) {
    return { kind: "remote", source: `github:sanjings/${builtin.value}` };
  }

  if (/^[a-z]+:/i.test(trimmed)) {
    return { kind: "remote", source: trimmed };
  }

  if (OWNER_REPO.test(trimmed)) {
    return { kind: "remote", source: `github:${trimmed}` };
  }

  /** 既不是内置也不是 owner/repo：当作 sanjings 组织下的仓库名（兼容老用法） */
  return { kind: "remote", source: `github:sanjings/${trimmed}` };
}

/**
 * 本地判定要和「两段式远程 id」区分开：
 * - `./foo`、`../foo`、绝对路径、Windows 盘符路径 → 本地
 * - 单独的 `foo/bar` **不算**本地（那是 owner/repo）
 */
function isLocalTemplatePath(input: string): boolean {
  if (input.startsWith(".")) return true;
  if (isAbsolute(input)) return true;
  if (/^[a-zA-Z]:[\\/]/.test(input)) return true;
  return false;
}
