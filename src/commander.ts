import { Command } from "commander";
import chalk from "chalk";
import { VERSION, CLI_BIN_NAME } from "./config";

export interface IOptions {
  force?: boolean;
  typescript?: boolean;
}

interface CommanderResult {
  projectName: string;
  options: IOptions;
}

export const initCommander = (): Promise<CommanderResult> => {
  return new Promise((resolve, reject) => {
    const program = new Command();

    // 配置版本号和基本信息（应该在命令配置之前）
    program
      .version(`v${VERSION}`, "-v, --version", "display version number")
      .usage("<command> [option]")
      .description("A simple frontend scaffolding tool")
      .on("--help", () => {
        console.log(
          `\r\nRun ${chalk.cyan(
            `${CLI_BIN_NAME} <command> --help`
          )} for detailed usage of given command\r\n`
        );
      });

    // 配置创建项目命令
    program
      .command("init <project-name>")
      .description("create a new project")
      .option("-f, --force", "overwrite target directory if it exist")
      .option("-t, --typescript", "add typescript support")
      .action((projectName: string, options: IOptions) => {
        if (!projectName || projectName.trim() === "") {
          console.error(chalk.red("Error: project name is required"));
          program.help();
          reject(new Error("Project name is required"));
          return;
        }
        resolve({ projectName: projectName.trim(), options });
      });

    // 处理未知命令
    program.on("command:*", () => {
      console.error(chalk.red(`Invalid command: ${program.args.join(" ")}`));
      console.log(
        `See ${chalk.cyan(`${CLI_BIN_NAME} --help`)} for available commands.`
      );
      reject(new Error("Invalid command"));
    });

    // 解析用户执行命令传入参数
    try {
      program.parse(process.argv);

      // 如果没有提供任何命令，显示帮助信息
      if (!process.argv.slice(2).length) {
        program.outputHelp();
        reject(new Error("No command provided"));
      }
    } catch (error) {
      reject(error);
    }
  });
};
