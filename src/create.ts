/**
 * 项目生成：从「选模板」到「目录可打开」的整条流水线。
 *
 * 依赖关系简图：commander 只负责传 projectName + InitOptions；本文件负责
 * 校验名 → 处理目标目录冲突 → 解析模板源（内置 / 远程 / 本地）→ 拉取或复制
 * → 改 package.json → 替换 {{占位符}} → 可选 git init → 打印下一步命令。
 */
import { execSync } from "node:child_process";
import { existsSync, rmSync, statSync } from "node:fs";
import { cp, stat } from "node:fs/promises";
import { join } from "node:path";

import chalk from "chalk";
import { downloadTemplate } from "giget";
import symbol from "log-symbols";
import validateNpmPackageName from "validate-npm-package-name";

import type { InitOptions } from "./commander.js";
import { CLI_BIN_NAME } from "./config.js";
import { overwritePrompt, templatePrompt } from "./prompt.js";
import { DEFAULT_TEMPLATES } from "./templates.js";
import { loadingFn } from "./utils/loading.js";
import { detectPackageManager, formatDevCommand, formatInstallCommand } from "./utils/pm.js";
import { rewritePackageJsonName } from "./utils/pkg-name.js";
import { renderTemplatePlaceholders } from "./utils/render.js";
import { resolveTemplateSpec } from "./utils/template-resolve.js";

/**
 * 在 process.cwd() 下创建 `projectName` 目录并写入模板内容。
 *
 * 覆盖策略（与常见脚手架一致）：
 * - 目标已存在且 **未** 带 `--force`：问用户；选 No 则 return（退出码 0，不算错误）。
 * - 带 `--force`：**不问**，直接删整个目标目录再生成（适合 CI / 脚本）。
 * - 目标存在但不是目录（同名文件）：无法处理，抛错。
 *
 * 模板来源：优先用 `options.template`（命令行 `-t`）；没传才弹 templatePrompt。
 */
export async function createProject(projectName: string, options: InitOptions): Promise<void> {
  const targetDir = join(process.cwd(), projectName);

  if (!assertValidPackageName(projectName)) {
    throw new Error("Invalid project name");
  }

  if (existsSync(targetDir)) {
    const stats = statSync(targetDir);
    if (!stats.isDirectory()) {
      throw new Error(`Target path ${targetDir} exists but is not a directory`);
    }

    if (!options.force) {
      const ok = await overwritePrompt();
      if (!ok) {
        console.log(chalk.yellow("\nOperation cancelled."));
        return;
      }
    }

    try {
      rmSync(targetDir, { recursive: true, force: true });
    } catch (error) {
      console.error(chalk.red(`Failed to remove directory: ${String(error)}`));
      throw error;
    }
  }

  let templateInput: string;
  try {
    templateInput = options.template?.trim() ?? (await templatePrompt(DEFAULT_TEMPLATES));
  } catch (error) {
    if (error instanceof Error && error.message === "User cancelled") {
      console.log(chalk.yellow("\nOperation cancelled."));
      return;
    }
    throw error;
  }

  const resolved = resolveTemplateSpec(templateInput, process.cwd(), DEFAULT_TEMPLATES);

  if (resolved.kind === "local") {
    await loadingFn(() => copyLocalTemplate(resolved.absolutePath, targetDir), "Copying local template...");
  } else {
    /**
     * giget 的 `dir` 指定解压目标；`force: true` 表示允许覆盖已存在文件。
     * 我们在上面已对「整目录冲突」做了 rm 或用户确认，这里传 force 主要是防止
     * giget 在部分边缘场景下因「目录非空」而拒绝写入。
     */
    await loadingFn(
      () =>
        downloadTemplate(resolved.source, {
          dir: targetDir,
          force: true,
        }),
      "Downloading template. Please wait...",
    );
  }

  rewritePackageJsonName(targetDir, projectName);

  await renderTemplatePlaceholders(targetDir, {
    projectName,
    author: process.env.npm_init_author_name ?? process.env.USER ?? process.env.USERNAME ?? "unknown",
    year: String(new Date().getFullYear()),
  });

  tryGitInit(targetDir);
  printSuccessHints(projectName);
}

/**
 * 用 npm 的包名规则校验目录名（同时也会变成 package.json 里的 `"name"`）。
 *
 * `validate-npm-package-name` 返回三类结果：完全合法、完全不合法、老包名兼容（Legacy）。
 * 这里只关心「新开仓库」场景，因此以 validForNewPackages 为准；warnings 仅提示。
 */
function assertValidPackageName(name: string): boolean {
  const { validForNewPackages, errors, warnings } = validateNpmPackageName(name);

  if (validForNewPackages) {
    if (warnings?.length) {
      console.log(chalk.yellow(`Package name warnings: ${warnings.join(", ")}`));
    }
    return true;
  }

  console.error(chalk.red(`Invalid npm package name: ${name}`));
  if (errors?.length) {
    console.error(chalk.red(errors.join("\n")));
  }
  return false;
}

/** 递归复制本地文件夹；源必须是目录，否则及早失败（避免 cp 出费解报错） */
async function copyLocalTemplate(src: string, dest: string): Promise<void> {
  const st = await stat(src);
  if (!st.isDirectory()) {
    throw new Error(`Local template is not a directory: ${src}`);
  }
  await cp(src, dest, { recursive: true });
}

/**
 * 给用户一个新仓库：即便模板自带 .git（一般不会），再 init 也是无害的。
 * Windows / 精简环境可能没有 git：execSync 抛错则忽略，不打搅成功流程。
 */
function tryGitInit(projectRoot: string): void {
  try {
    execSync("git init", { cwd: projectRoot, stdio: "ignore" });
  } catch {
    /* no-op */
  }
}

/**
 * 末尾的人话指引：`cd` + 装依赖 + 跑 dev。
 * 安装命令随 detectPackageManager() 变化，避免 pnpm 用户看到一堆 npm 用语。
 */
function printSuccessHints(projectName: string): void {
  const pm = detectPackageManager();
  console.log(`\r\n${symbol.success} Successfully created project ${chalk.cyan(projectName)}!`);
  console.log(`\r\n  ${chalk.gray("cd")} ${chalk.cyan(projectName)}`);
  console.log(`  ${chalk.gray(formatInstallCommand(pm))}`);
  console.log(`  ${chalk.gray(formatDevCommand(pm))}`);
  console.log(`\r\nSee ${chalk.cyan(`${CLI_BIN_NAME} init --help`)} for more options.\r\n`);
}
