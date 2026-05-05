/**
 * 读取「脚手架包自身」的 package.json（版本号、bin 名、包名）。
 *
 * 编译后是 CommonJS 风格的 dist，但源码按 ESM 跑；直接 `import pkg from '../package.json'`
 * 在 NodeNext + 当前目录结构下容易和输出目录错位，因此用 createRequire(import.meta.url)
 * 定位到仓库根目录那份 package.json，和运行时从 npm 全局安装的路径无关。
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

interface OwnPackageJson {
  version?: string;
  bin?: Record<string, string>;
  name?: string;
}

const ownPackage: OwnPackageJson = (() => {
  try {
    return require("../package.json") as OwnPackageJson;
  } catch {
    /** 极端情况：被人拷贝了 dist 却没带 package.json；兜底空对象，下面常量再给默认值 */
    return {};
  }
})();

/**
 * npm 上展示的版本。读不到时不抛异常，避免 CLI 连 help 都打不开。
 */
export const VERSION: string = ownPackage.version ?? "0.0.0";

/**
 * 提示文案里写的命令名（例如 `s-cli init`）。
 * 取 bin 字段的第一个 key，与 npm link / 全局安装后的可执行文件名一致。
 */
export const CLI_BIN_NAME: string = (ownPackage.bin && Object.keys(ownPackage.bin)[0]) || "s-cli";

/**
 * update-notifier 要求 name/version 与 registry 上一致，否则比对不到新版本。
 */
export const pkgForNotifier = {
  name: ownPackage.name ?? "sanjing-cli",
  version: VERSION,
};
