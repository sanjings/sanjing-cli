/**
 * 所有需要用户用键盘选行的交互，都集中在这里，方便以后替换成别的 TUI 或测单测时 mock。
 *
 * inquirer@8 与当前 TypeScript 配置配合时，用 `ListQuestion` 比泛型 `Question` 更准，
 * 这样 choices 的 value 类型能喂给泛型 prompt。
 */
import inquirer, { type ListQuestion } from "inquirer";

import type { BuiltinTemplate } from "./templates.js";

/**
 * 目标目录已存在且用户 **没有** 传 `-f` 时弹出。
 *
 * 返回值：true = 继续往下走（随后会删目录）；false = 用户选 No，上层应安静退出。
 * Ctrl+C / ESC：inquirer 会 reject，这里统一转成 `User cancelled`，避免把底层栈暴露给用户。
 */
export async function overwritePrompt(): Promise<boolean> {
  const question: ListQuestion = {
    type: "list",
    name: "action",
    message: "Target directory already exists. Overwrite it?",
    choices: [
      { name: "Yes", value: true },
      { name: "No", value: false },
    ],
  };

  try {
    const { action } = await inquirer.prompt<{ action: boolean }>([question]);
    return action;
  } catch {
    throw new Error("User cancelled");
  }
}

/**
 * 列出内置模板让用户选一条。
 *
 * 注意返回值：每个选项的 **value** 是模板仓库 slug（DEFAULT_TEMPLATES[].value），
 * 不是给用户看的 name；后续 resolveTemplateSpec 用 slug 去对齐内置表或远程规则。
 */
export async function templatePrompt(templates: BuiltinTemplate[]): Promise<string> {
  const question: ListQuestion = {
    type: "list",
    name: "name",
    message: "Choose a template:",
    choices: templates.map((template) => ({
      name: template.description ? `${template.name} — ${template.description}` : template.name,
      value: template.value,
    })),
  };

  try {
    const { name } = await inquirer.prompt<{ name: string }>([question]);
    return name;
  } catch {
    throw new Error("User cancelled");
  }
}
