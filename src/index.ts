/**
 * CLI 进程入口（对应 package.json 里 bin 指向的 ../dist/index.js）。
 *
 * 启动顺序：先用 update-notifier 检查 npm 上是否有新版本 → parseCli 解析子命令 →
 * list 只打印模板表；init 则进入 createProject。全局注册的两个 process.on 是兜底：
 * 防止某个路径忘记 await 导致进程静默退出或悬挂 Promise。
 */
import chalk from "chalk";
import symbol from "log-symbols";
import updateNotifier from "update-notifier";

import { parseCli } from "./commander.js";
import { pkgForNotifier } from "./config.js";
import { createProject } from "./create.js";
import { printBuiltinTemplates } from "./list.js";

/** 全局安装时提示升级；isGlobal 避免在本地开发仓库里误提示 */
updateNotifier({ pkg: pkgForNotifier }).notify({ isGlobal: true });

/**
 * 业务入口（也可被其它模块 import 做集成测试）。
 *
 * 错误约定（与 parseCli / prompt / createProject 对齐）：
 * - `No command provided`：用户没带任何参数，上面已经 outputHelp，不算失败，exit 0。
 * - `Invalid command`：commander 已把说明打到 stderr，这里也不重复打红字，exit 由 parseCli 里设的 exitCode 决定。
 * - `User cancelled`：Inquirer 被 Ctrl+C 中断，安静退出。
 * 其它 Error：视为真正的失败，打印红字后 `process.exit(1)`。
 */
export async function init(): Promise<void> {
  try {
    const action = await parseCli();

    if (action.type === "list") {
      printBuiltinTemplates();
      return;
    }

    await createProject(action.projectName, action.options);
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message;
      if (message === "No command provided" || message === "Invalid command" || message === "User cancelled") {
        return;
      }
      console.error(chalk.red(`\n${symbol.error} ${message}`));
    }
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason, promise) => {
  console.error(chalk.red(`\n${symbol.error} Unhandled Rejection at:`, promise, "reason:", reason));
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error(chalk.red(`\n${symbol.error} Uncaught Exception:`, err));
  process.exit(1);
});

/** 顶层立刻执行；void 表示刻意忽略返回的 Promise（错误已在 init 内处理） */
void init();
