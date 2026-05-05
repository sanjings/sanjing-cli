/**
 * `s-cli list` 子命令的唯一输出出口，与 parseCli 里 `{ type: 'list' }` 分支对应。
 * 数据来自 templates.ts，避免在 commander 里硬编码字符串。
 */
import chalk from "chalk";

import { DEFAULT_TEMPLATES } from "./templates.js";

/** 终端友好打印：绿色短名 + 灰色仓库 slug + 可选说明 */
export function printBuiltinTemplates(): void {
  console.log(chalk.cyan("Built-in templates:\n"));
  for (const item of DEFAULT_TEMPLATES) {
    const tail = item.description ? chalk.gray(` — ${item.description}`) : "";
    console.log(`  ${chalk.green(item.name)}  ${chalk.gray(`(${item.value})`)}${tail}`);
  }
  console.log();
}
