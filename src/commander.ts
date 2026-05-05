/**
 * Commander 配置：定义子命令、全局选项，以及把 argv 解析成程序内部用的 CliAction。
 *
 * 这里刻意不用「单一命令 + 大量 optional」，而是 `list` / `init` 两个子命令，
 * 这样 help 文案更清晰，也方便以后加 `doctor`、`upgrade` 之类子命令。
 */
import chalk from "chalk";
import { Command } from "commander";

import { CLI_BIN_NAME, VERSION } from "./config.js";

/** `init` 子命令上挂载的 flag；commander 解析后会注入 action 的第二个参数 */
export interface InitOptions {
  force?: boolean;
  template?: string;
}

/**
 * 解析结果：只有两种意图。
 * - list：只读展示，不碰文件系统。
 * - init：要在 cwd 下建目录、下载模板。
 */
export type CliAction = { type: "list" } | { type: "init"; projectName: string; options: InitOptions };

/**
 * 把 process.argv 转成 CliAction。
 *
 * 实现要点：
 * 1. `action` 变量由各个子命令的 `.action()` 回调赋值；parseAsync 结束时要么已赋值，要么用户输入不合法。
 * 2. argv 为空时先手动 outputHelp 再抛错：这样「无参运行」和「打错子命令」的表现区分开。
 * 3. `command:*` 捕获未知子命令：operands 是 commander 拆出来的 token，用它打印比读 program.args 稳。
 * 4. 解析完成后若 `process.exitCode` 已被设为非 0（未知命令场景），不再纠结 action，直接抛 Invalid command。
 */
export async function parseCli(): Promise<CliAction> {
  const program = new Command();
  /** 由具体子命令的 action 填充；parse 结束时若为 undefined 说明用户没触发任何子命令 */
  let action: CliAction | undefined;

  program
    .name(CLI_BIN_NAME)
    .version(`v${VERSION}`, "-v, --version", "display version number")
    .description("A simple frontend scaffolding tool")
    .on("--help", () => {
      console.log(`\r\nRun ${chalk.cyan(`${CLI_BIN_NAME} <command> --help`)} for detailed usage of given command\r\n`);
    });

  program.on("command:*", (operands: string[]) => {
    console.error(chalk.red(`Invalid command: ${operands.join(" ") || "<unknown>"}`));
    console.log(`See ${chalk.cyan(`${CLI_BIN_NAME} --help`)} for available commands.`);
    process.exitCode = 1;
  });

  program
    .command("list")
    .description("list built-in templates")
    .action(() => {
      action = { type: "list" };
    });

  program
    .command("init <project-name>")
    .description("create a new project")
    .option("-f, --force", "overwrite target directory if it exists")
    .option("-t, --template <spec>", "built-in id, owner/repo[#ref], provider:src, or local path")
    .action((projectName: string, opts: InitOptions) => {
      if (!projectName?.trim()) {
        console.error(chalk.red("Error: project name is required"));
        process.exitCode = 1;
        return;
      }
      action = {
        type: "init",
        projectName: projectName.trim(),
        options: {
          force: opts.force,
          template: opts.template,
        },
      };
    });

  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    program.outputHelp();
    throw new Error("No command provided");
  }

  await program.parseAsync(process.argv);

  if (process.exitCode && process.exitCode !== 0) {
    throw new Error("Invalid command");
  }

  if (!action) {
    throw new Error("No command provided");
  }

  return action;
}
