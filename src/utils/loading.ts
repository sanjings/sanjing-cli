import ora from 'ora';
import chalk from 'chalk';

export const loadingFn = async (fn: Function, message = 'loading...', ...args: any[]) => {
  // 使用 ora 初始化，传入提示信息 message
  const loading = ora(message);
  // 开始加载动画
  loading.start();

  try {
    // 执行传入方法 fn
    const result = await fn(...args);
    // 状态为修改为成功
    loading.succeed();
    return result;
  } catch (error) {
    // 状态为修改为失败
    loading.fail();
    console.log(`failed: ${chalk.red(`${error}`)}`);
    return error;
  }
};
