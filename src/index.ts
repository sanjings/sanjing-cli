import { initCommander } from "./commander";
import { Create } from "./create";
import chalk from "chalk";
import symbol from "log-symbols";

/**
 * 初始化 CLI 应用
 */
export const init = async (): Promise<void> => {
  try {
    const { projectName, options } = await initCommander();
    new Create(projectName, options);
  } catch (error) {
    // 用户取消或命令错误时不显示错误信息
    if (error instanceof Error) {
      const message = error.message;
      if (message === "No command provided" || message === "Invalid command") {
        // 这些情况已经在 commander 中处理了
        return;
      }
      if (message === "User cancelled") {
        return;
      }
      console.error(chalk.red(`\n${symbol.error} ${message}`));
    }
    process.exit(1);
  }
};

// 处理未捕获的异常
process.on("unhandledRejection", (reason, promise) => {
  console.error(
    chalk.red(
      `\n${symbol.error} Unhandled Rejection at:`,
      promise,
      "reason:",
      reason
    )
  );
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error(chalk.red(`\n${symbol.error} Uncaught Exception:`, error));
  process.exit(1);
});

init();
