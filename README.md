# sanjing-cli

简易前端脚手架：从内置模板或任意 Git 仓库拉取代码，生成可运行的项目目录。

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
```

不设全局命令也可调试（推荐）：用脚本入口，`--` 后面接和普通 CLI 一样的参数：

```bash
pnpm run cli -- list
pnpm run cli -- init demo-app -t vue3-element-admin
```

另开一个终端跑 `pnpm run dev`（`tsc -w`），改 TS 会自动编译 `dist/`，再重复执行上面的 `pnpm run cli -- …`。

### 可选：`pnpm link --global` 与本机 pnpm 全局目录

若执行 `pnpm config get global-bin-dir` 为 **空 / undefined**，说明还没配置全局 bin 目录，`pnpm link --global` 会失败。可先手动指定（路径按你机器调整，目录需存在）：

**Windows（CMD）示例：**

```bat
mkdir "%LOCALAPPDATA%\pnpm" 2>nul
pnpm config set global-bin-dir "%LOCALAPPDATA%\pnpm"
```

然后把 **`%LOCALAPPDATA%\pnpm`**（展开后的完整路径）加入用户 **PATH**，执行一次 **`pnpm setup`** 或重启终端 / IDE 后再试：

```bash
pnpm link --global
s-cli list
```

脚本一览：`pnpm run cli`（跑编译产物）、`pnpm run dev`（监听编译）、`pnpm run test`、`pnpm run lint`、`pnpm run format`。

持续集成仍由 [`.github/workflows/ci.yml`](.github/workflows/ci.yml) 在 push / PR 上跑 `lint` + `build` + `test`。

## License

ISC
