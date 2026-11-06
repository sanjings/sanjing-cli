# 本地调试

在仓库根目录操作。需要 Node.js 20+，包管理器用 pnpm（`package.json` 的 `packageManager` 为 `pnpm@9.15.0`；`preinstall` 会拒绝其它包管理器）。

## 日常脚本

先安装依赖并编译。`cli` 与下面的全局命令都读取 `dist/`，所以先 `build`。

```bash
pnpm install
pnpm run build
pnpm run cli -- -v
pnpm run cli -- list
pnpm run dev
pnpm run test
pnpm run lint
```

| 脚本 | 做什么 |
| --- | --- |
| `build` | `tsc`，产物在 `dist/` |
| `cli` | `node dist/index.js`。参数写在 `--` 后面，和全局命令相同 |
| `dev` | `tsc -w`。另开一个终端，改完 TS 后再跑 `pnpm run cli -- …` |
| `test` | `vitest run` |
| `lint` | `eslint .` |

日常调试用 `pnpm run cli` 即可。还有 `pnpm run format`（Prettier 写回）、`pnpm run test:watch`、`pnpm run clean`（删除 `dist/`）。

## 用本地构建试跑全局命令

`s-cli` 与 `sanjing-cli` 都指向 `bin/cmd`，入口加载 `dist/index.js`。先编译，再把当前仓库链到全局：

```bash
pnpm install
pnpm run build
pnpm link --global
s-cli -v
s-cli list
sanjing-cli -v
```

两条命令等价，试跑的是这次本地构建。之后改源码，继续用 `pnpm run dev`，或再执行一次 `pnpm run build`；`s-cli` 读的是同一份 `dist/`。要卸掉这条全局链接，在仓库根目录执行 `pnpm unlink --global`。

### Windows：`global-bin-dir` 为空

先看 `pnpm config get global-bin-dir`。输出为**空**或 `undefined` 时，还没配置全局 bin 目录，`pnpm link --global` 会失败。指定一个已存在的目录（路径按本机调整）：

```bat
mkdir "%LOCALAPPDATA%\pnpm" 2>nul
pnpm config set global-bin-dir "%LOCALAPPDATA%\pnpm"
```

把展开后的 `%LOCALAPPDATA%\pnpm` 加入用户 **PATH**，执行一次 **`pnpm setup`**，或重启终端 / IDE，然后再跑上面的 `pnpm link --global`、`s-cli -v` 和 `s-cli list`。

其它系统上，若 `pnpm config get global-bin-dir` 已有目录且该目录在 PATH 中，直接 `pnpm link --global`。输出为空时先执行 `pnpm setup`，再开一个新终端。
