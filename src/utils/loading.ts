import ora, { Ora } from "ora";
import chalk from "chalk";

/**
 * 加载函数类型定义
 */
type LoadingFunction<T extends any[] = any[], R = any> = (
  ...args: T
) => Promise<R>;

/**
 * 带加载提示的异步函数执行器
 * @param fn 要执行的异步函数
 * @param message 加载提示信息
 * @param args 传递给函数的参数
 * @returns 函数执行结果，失败时返回 false
 */
export const loadingFn = async <T extends any[] = any[], R = any>(
  fn: LoadingFunction<T, R>,
  message = "Loading...",
  ...args: T
): Promise<R | false> => {
  // 使用 ora 初始化，传入提示信息 message
  const loading: Ora = ora(message);
  // 开始加载动画
  loading.start();

  try {
    // 执行传入方法 fn
    const result = await fn(...args);
    // 状态修改为成功
    loading.succeed();
    return result !== undefined && result !== null ? result : (true as R);
  } catch (error) {
    // 状态修改为失败
    loading.fail();
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`${chalk.red("Failed:")} ${errorMessage}`);
    return false as R | false;
  }
};
