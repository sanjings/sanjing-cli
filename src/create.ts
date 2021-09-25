import { IOptions } from './commander';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { overwritePrompy, templatePrompy } from './prompy';
import { loadingFn } from './utils/loading';
import chalk from 'chalk';
import downloadGitRepo from 'download-git-repo';
import symbol from 'log-symbols';

export class Create {
  private targetDir: string;

  constructor(private projectName: string, private options: IOptions) {
    this.projectName = projectName;
    this.options = options;
    this.targetDir = this._getTargetDir(projectName);
    this._init();
  }

  private async _init() {
    const { targetDir, options } = this;
    // 判断要创建的目录是否存在
    const isExit = fs.existsSync(targetDir);

    if (isExit) {
      if (options.force) {
        const result = await this._confrimOverwrite();
        if (!result) return;
        this._createProject();
      } else {
        console.log(`\r\n${symbol.error} Target directory already exists. Please use add -f to overwrite it.`);
        console.log(`Run ${chalk.cyan(`i-cli init --help`)} for detail.\r\n`);
        return;
      }
    } else {
      this._createProject();
    }
  }

  /**
   * 获取项目路径
   * @param name 项目名字
   */
  private _getTargetDir(name: string): string {
    // 获取当前命令行选择的目录
    const cwd = process.cwd();

    // 需要创建的目录地址
    return path.join(cwd, name);
  }

  /**
   * 确定是否覆盖目标目录，确定后删除掉目标目录
   * @param targetDir 目标目录
   * @returns true | false
   */
  private async _confrimOverwrite(): Promise<boolean> {
    const answer = await overwritePrompy();
    if (answer) {
      fs.rmdirSync(this.targetDir, { recursive: true });
      return true;
    }
    return false;
  }

  /**
   * 获取项目路径
   * @param name 项目名字
   */
  private async _createProject() {
    const tmpName = await templatePrompy();
    await this._downTemplate(tmpName);
  }

  /**
   * 远程下载模板
   * @param tmpName 模板名称
   */
  private async _downTemplate(tmpName: string) {
    const { projectName, targetDir } = this;
    const requestUrl = `github:sanjings/${tmpName}`;
    const down = util.promisify(downloadGitRepo);
    await loadingFn(down, 'downloading template. please wait ...', requestUrl, targetDir);
    console.log(`\r\n${symbol.success} Successfully created project ${chalk.cyan(projectName)}!`);
    console.log(`\r\ncd ${chalk.cyan(projectName)}`);
    console.log('yarn');
    console.log('yarn dev\r\n');
  }
}
