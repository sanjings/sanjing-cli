import { IOptions } from "./commander";
import { existsSync, rmSync, statSync } from "fs";
import { join } from "path";
import { overwritePrompt, templatePrompt } from "./prompt";
import { loadingFn } from "./utils/loading";
import chalk from "chalk";
import downloadGitRepo from "download-git-repo";
import symbol from "log-symbols";
import { CLI_BIN_NAME } from "./config";

export class Create {
  private readonly targetDir: string;

  constructor(
    private readonly projectName: string,
    private readonly options: IOptions
  ) {
    this.targetDir = this._getTargetDir(projectName);
    this._init().catch((error) => {
      console.error(
        chalk.red(
          `\n${symbol.error} Failed to create project: ${error.message}`
        )
      );
      process.exit(1);
    });
  }

  private async _init(): Promise<void> {
    const { targetDir, options } = this;

    // 验证项目名称
    if (!this._validateProjectName(this.projectName)) {
      throw new Error("Invalid project name");
    }

    // 判断要创建的目录是否存在
    const isExist = existsSync(targetDir);

    if (isExist) {
      // 检查是否是目录
      const stats = statSync(targetDir);
      if (!stats.isDirectory()) {
        throw new Error(
          `Target path ${targetDir} exists but is not a directory`
        );
      }

      if (options.force) {
        const result = await this._confirmOverwrite();
        if (!result) {
          console.log(chalk.yellow("\nOperation cancelled."));
          return;
        }
        await this._createProject();
      } else {
        console.log(
          `\r\n${symbol.error} Target directory already exists. Please use -f to overwrite it.`
        );
        console.log(
          `Run ${chalk.cyan(`${CLI_BIN_NAME} init --help`)} for detail.\r\n`
        );
        return;
      }
    } else {
      await this._createProject();
    }
  }

  /**
   * 验证项目名称
   * @param name 项目名字
   */
  private _validateProjectName(name: string): boolean {
    // 项目名称不能包含特殊字符
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(name)) {
      console.error(
        chalk.red(
          `Invalid project name: ${name}. Project name cannot contain special characters.`
        )
      );
      return false;
    }
    return true;
  }

  /**
   * 获取项目路径
   * @param name 项目名字
   */
  private _getTargetDir(name: string): string {
    // 获取当前命令行选择的目录
    const cwd = process.cwd();
    // 需要创建的目录地址
    return join(cwd, name);
  }

  /**
   * 确定是否覆盖目标目录，确定后删除掉目标目录
   * @returns true | false
   */
  private async _confirmOverwrite(): Promise<boolean> {
    const answer = await overwritePrompt();
    if (answer) {
      try {
        rmSync(this.targetDir, { recursive: true, force: true });
        return true;
      } catch (error) {
        console.error(chalk.red(`Failed to remove directory: ${error}`));
        throw error;
      }
    }
    return false;
  }

  /**
   * 创建项目
   */
  private async _createProject(): Promise<void> {
    try {
      const templateName = await templatePrompt();
      await this._downloadTemplate(templateName);
    } catch (error) {
      if (error instanceof Error && error.message === "User cancelled") {
        console.log(chalk.yellow("\nOperation cancelled."));
        return;
      }
      throw error;
    }
  }

  /**
   * 远程下载模板
   * @param templateName 模板名称
   */
  private async _downloadTemplate(templateName: string): Promise<void> {
    const { projectName, targetDir } = this;
    const requestUrl = `github:sanjings/${templateName}`;

    try {
      const downloadFn = async (url: string, dest: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          downloadGitRepo(url, dest, (error: Error | null) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        });
      };

      const result = await loadingFn(
        downloadFn,
        "Downloading template. Please wait...",
        requestUrl,
        targetDir
      );

      if (result !== false) {
        console.log(
          `\r\n${symbol.success} Successfully created project ${chalk.cyan(
            projectName
          )}!`
        );
        console.log(`\r\n  ${chalk.gray("cd")} ${chalk.cyan(projectName)}`);
        console.log(
          `  ${chalk.gray("yarn")} ${chalk.gray("or")} ${chalk.gray(
            "npm install"
          )}`
        );
        console.log(
          `  ${chalk.gray("yarn dev")} ${chalk.gray("or")} ${chalk.gray(
            "npm run dev"
          )}\r\n`
        );
      } else {
        throw new Error("Failed to download template");
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Template download failed: ${error.message}`);
      }
      throw error;
    }
  }
}
