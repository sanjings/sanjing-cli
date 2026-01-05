import inquirer, { Question } from "inquirer";

/**
 * 询问用户是否确定要覆盖目录
 */
export const overwritePrompt = async (): Promise<boolean> => {
  const question: Question = {
    name: "action",
    type: "list",
    message: "Target directory already exists. Are you sure to overwrite it?",
    choices: [
      {
        name: "Yes",
        value: true,
      },
      {
        name: "No",
        value: false,
      },
    ],
  } as Question;

  try {
    const { action } = await inquirer.prompt([question]);
    return action as boolean;
  } catch (error) {
    // 用户按 Ctrl+C 取消
    throw new Error("User cancelled");
  }
};

/**
 * 模板配置接口
 */
export interface Template {
  name: string;
  value: string;
  description?: string;
}

/**
 * 默认模板列表
 */
const DEFAULT_TEMPLATES: Template[] = [
  {
    name: "vue2-element",
    value: "vue2-template",
    description: "Vue 2 + Element UI template",
  },
  {
    name: "vue3-element-admin",
    value: "vue3-element-admin",
    description: "Vue 3 + Element Plus Admin template",
  },
  {
    name: "uni-ts",
    value: "uni-vscode-ts-template",
    description: "UniApp TypeScript template",
  },
];

/**
 * 询问用户选择模板
 */
export const templatePrompt = async (
  templates: Template[] = DEFAULT_TEMPLATES
): Promise<string> => {
  const question: Question = {
    name: "name",
    type: "list",
    message: "Please choose a template to create project:",
    choices: templates.map((template) => ({
      name: template.description
        ? `${template.name} - ${template.description}`
        : template.name,
      value: template.value,
    })),
  } as Question;

  try {
    const { name } = await inquirer.prompt([question]);
    return name as string;
  } catch (error) {
    // 用户按 Ctrl+C 取消
    throw new Error("User cancelled");
  }
};
