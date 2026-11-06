# sanjing-cli

[![CI](https://github.com/sanjings/sanjing-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/sanjings/sanjing-cli/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/sanjing-cli)](https://www.npmjs.com/package/sanjing-cli)

简易前端脚手架：从内置模板或任意 Git 仓库拉取代码，生成可运行的项目目录。

## 当前状态

`main` 在 npm 已发布版本 **1.1.0** 之后还有未发版变更，包括 [#1](https://github.com/sanjings/sanjing-cli/pull/1) 的冷启动与本地模板生成，以及 [#7](https://github.com/sanjings/sanjing-cli/pull/7) 的 CI pnpm 版本读取。这些差异记在 [CHANGELOG.md](CHANGELOG.md)。npm 徽章显示的是 registry 里的 **1.1.0**。`pnpm add -g sanjing-cli` 与 `npm i -g sanjing-cli` 装到的也是这个已发布版本。

- **本周期暂不推 npm**。本周期不执行 `npm publish`，也不为这些未发版变更打 tag 或开 Release。
- **内置模板暂不刷新**。内置模板继续使用现有来源（`vue2-template`、`vue3-element-admin`、`uni-vscode-ts-template`）。本周期不改模板源、不改模板内容，也不挂、不切换到私有仓库（例如 `vue3-admin-starter`、`uniapp-starter`）。

## 环境要求

- Node.js **20+**
- 包管理推荐使用 **pnpm**（本仓库已通过 `only-allow` 锁定）

## 安装（使用者）

```bash
pnpm add -g sanjing-cli
# 或
npm i -g sanjing-cli
```

全局命令：`s-cli`（与 `sanjing-cli` 等价）。

## 常用命令

```bash
# 版本
s-cli -v

# 列出内置模板
s-cli list

# 交互式创建（会询问模板）
s-cli init my-app

# 指定模板（内置 id、GitHub `owner/repo`，或 giget 支持的 `provider:src`）
s-cli init my-app -t vue3-element-admin

# 覆盖已存在目录：不加 -f 会先询问；加 -f 直接删除后重建
s-cli init my-app -f
s-cli init my-app -t uni-ts -f

# 使用本机目录作为模板
s-cli init my-app -t ./my-local-template
```

### `init` 参数说明

- **`<project-name>`**：生成目录名，同时会校验 **npm 包名**规则，并写入 `package.json` 的 `name`。
- **`-f, --force`**：目标目录已存在时不再询问，直接覆盖。
- **`-t, --template <spec>`**：模板来源。可以是内置名称/`value`、形如 `owner/repo` 的 GitHub 简写、`gitlab:` 等显式前缀，或以 `./`、绝对路径给出的本地文件夹。

创建完成后会尝试在目录内执行 `git init`（未安装 git 则静默跳过）。终端里给出的 `pnpm install` / `yarn` / `npm install` 提示会尽量贴合你当前使用的包管理器。

## 本地开发本仓库

```bash
pnpm install
pnpm run build
pnpm run cli -- list
```

`pnpm run cli` 跑编译产物，`--` 后面接和全局命令一样的参数。改 TypeScript 时另开终端执行 `pnpm run dev`（`tsc -w`）。全局联调（先 `build` 再 `pnpm link --global`，以及 Windows 上 `global-bin-dir` 为空时怎么配）见 [本地调试](docs/local-dev.md)。

持续集成仍由 [`.github/workflows/ci.yml`](.github/workflows/ci.yml) 在 push / PR 上跑 `lint` + `build` + `test`。

## License

ISC
