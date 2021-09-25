import { Command } from 'commander';
import chalk from 'chalk';

export interface IOptions {
  force: boolean;
}

export const initCommander = (): Promise<any> => {
  return new Promise(resolve => {
    const program = new Command();
    // 配置创建项目命令
    program
      .command('init <project-name>')
      .description('create a new project')
      .option('-f, --force', 'overwrite target directory if it exist')
      .option('-ts, --typescript', 'add typescript')
      .action((projectName: string, options: IOptions) => resolve({ projectName, options }));

    program
      // 配置版本号信息
      .version(`v${require('../package.json').version}`)
      .usage('<command> [option]')
      .on('--help', () => {
        console.log(`\r\nRun ${chalk.cyan(`i-cli <command> --help`)} for detailed usage of given command\r\n`);
      });

    // 解析用户执行命令传入参数
    program.parse(process.argv);
  });
};
