# Changelog

本文件记录本项目值得关注的变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

npm 上目前的版本是 **1.0.1**（2026-01-06）和 **1.1.0**（2026-05-05）。
这两次发布都没有对应的 git tag，文末链接指向当时的提交。日期取 npm 发布日。

## [Unreleased]

### Added

- 为占位符渲染、命令行解析和本地模板复制补充单元测试（[#1](https://github.com/sanjings/sanjing-cli/pull/1)）。
- 新增本变更记录，并在 README 中链到此文件（[#4](https://github.com/sanjings/sanjing-cli/issues/4)）。
- 仓库根目录增加 ISC `LICENSE`，与 `package.json` 的 `license` 一致（[#5](https://github.com/sanjings/sanjing-cli/issues/5)）。
- 增加 [本地调试](docs/local-dev.md)：日常 `build` / `cli` / `dev` / `test` / `lint`、`pnpm link --global`（含 Windows 上 `global-bin-dir` 为空时的配置），以及用本地构建试跑 `s-cli` / `sanjing-cli`。README 只留短入口（[#6](https://github.com/sanjings/sanjing-cli/issues/6)）。

### Changed

- 加快冷启动：`update-notifier` 改到 `setImmediate` 中动态加载；`create` 与 `giget` 按需引入，使 `list` 和 `-v` 不再带上这些依赖（[#1](https://github.com/sanjings/sanjing-cli/pull/1)）。
- 占位符渲染改为并行读写，目录遍历也并行。文本类型增加 `.txt`、`.toml`、`.svg`、`.xml`，并纳入 `.env*`、`.gitignore`、`.npmrc`、`.editorconfig`、`.prettierignore`、`.prettierrc`（[#1](https://github.com/sanjings/sanjing-cli/pull/1)）。
- 从本地目录复制模板时跳过 `node_modules`、`.git`、`dist`、`build`、`coverage`（[#1](https://github.com/sanjings/sanjing-cli/pull/1)）。
- README 增加 CI 与 npm 徽章，并写明 `main` 相对 npm **1.1.0** 仍有未发版变更、本周期不推 npm、内置模板不刷新（[#8](https://github.com/sanjings/sanjing-cli/pull/8)）。

### Fixed

- CI 的 `pnpm/action-setup` 不再写死 `version: 9`，只读取 `package.json` 的 `packageManager`（`pnpm@9.15.0`）。此前 Node 20 与 Node 22 会在安装 pnpm 时因版本冲突失败（[#7](https://github.com/sanjings/sanjing-cli/pull/7)）。

## [1.1.0] - 2026-05-05

对应提交 [`24e2d5e`](https://github.com/sanjings/sanjing-cli/commit/24e2d5eb33410656229d7e1490021f8c678094f9)。相对已发布的 **1.0.1**：

### Added

- `list` 子命令，列出内置模板。
- `init` 的 `-t, --template <spec>`：内置名称或仓库名、`owner/repo`（可带 `#ref`）、带协议前缀的 giget 源（例如 `gitlab:org/repo`），或以 `./`、绝对路径给出的本地目录。
- 模板占位符替换（`{{projectName}}` 等）。
- 用 `validate-npm-package-name` 按新包名规则校验项目名，并写入生成目录里 `package.json` 的 `name`。
- 生成完成后尝试 `git init`；失败则跳过。
- 按当前包管理器提示安装命令和 `dev` 命令（识别 `pnpm`、`yarn`，其余回落到 `npm`）。
- 全局安装时用 `update-notifier` 检查 npm 上是否有新版本。
- 仓库改用 pnpm（`packageManager` 为 `pnpm@9.15.0`），并加入 ESLint、Prettier、Vitest，以及在 Node 20 与 Node 22 上运行 lint、build、test 的 GitHub Actions。

### Changed

- 远程模板下载由 `download-git-repo` 改为 `giget`。
- 运行要求改为 Node.js 20 及以上。
- 目标目录已存在时，不加 `-f` 会询问是否覆盖；加上 `-f, --force` 则直接删除后重建。
- 短选项 `-t` 改为 `--template`，用来指定模板来源。

## [1.0.1] - 2026-01-06

npm 记录的 `gitHead` 是 [`188643b`](https://github.com/sanjings/sanjing-cli/commit/188643b099b54b66f525f65d4a7f8bf92dd01d71)。该提交的 `package.json` 把 `version` 写成了 `1.1.0`，发布到 registry 的版本号是 **1.0.1**；依赖与 `engines`（Node.js 18+、`download-git-repo`）与该提交一致。

### Added

- `init <project-name>`：交互选择内置模板后，用 `download-git-repo` 拉取 `github:sanjings/<repo>`。
- 内置模板为 `vue2-element`（`vue2-template`）、`vue3-element-admin`、`uni-ts`（`uni-vscode-ts-template`）。
- `-f, --force`：目标目录已存在时询问是否覆盖；未加 `-f` 则报错退出。
- `-v, --version` 显示版本。

### Changed

- 声明运行要求为 Node.js 18 及以上。
- 项目名若包含 `<>:"/\|?*` 或控制字符，则拒绝创建。

[Unreleased]: https://github.com/sanjings/sanjing-cli/compare/24e2d5eb33410656229d7e1490021f8c678094f9...HEAD
[1.1.0]: https://github.com/sanjings/sanjing-cli/compare/188643b099b54b66f525f65d4a7f8bf92dd01d71...24e2d5eb33410656229d7e1490021f8c678094f9
[1.0.1]: https://github.com/sanjings/sanjing-cli/commit/188643b099b54b66f525f65d4a7f8bf92dd01d71
