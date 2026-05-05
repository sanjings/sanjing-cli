/**
 * 内置模板的数据源：`list` 展示、`templatePrompt` 下拉、`resolveTemplateSpec` 命中内置时用。
 *
 * - name：给人看的简称。
 * - value：GitHub 上 sanjings 组织下的仓库目录名；最终会拼成 giget 源 `github:sanjings/<value>`。
 *
 * 若用户改用 `-t owner/repo` 或 `-t ./本地路径`，则完全不依赖这张表。
 */
export interface BuiltinTemplate {
  name: string;
  value: string;
  description?: string;
}

export const DEFAULT_TEMPLATES: BuiltinTemplate[] = [
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
