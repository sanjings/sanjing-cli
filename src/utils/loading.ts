/**
 * 给异步步骤加 ora 转圈：下载模板 / 复制目录可能较慢，避免用户以为卡死。
 *
 * 约定：内部任务抛错时，先 `spinner.fail()` 再打一行红色 Failed，然后把 **同一个 error**
 * 继续往上抛，这样 createProject 不用解析返回值是 false 还是异常。
 */
import chalk from "chalk";
import ora, { type Ora } from "ora";

type AsyncFn<T extends unknown[] = unknown[], R = unknown> = (...args: T) => Promise<R>;

export async function loadingFn<T extends unknown[] = unknown[], R = unknown>(
  fn: AsyncFn<T, R>,
  message = "Loading...",
  ...args: T
): Promise<R> {
  const spinner: Ora = ora(message);
  spinner.start();

  try {
    const result = await fn(...args);
    spinner.succeed();
    return result;
  } catch (error) {
    spinner.fail();
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`${chalk.red("Failed:")} ${errorMessage}`);
    throw error;
  }
}
