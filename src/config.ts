import { readFileSync } from "fs";
import { join } from "path";

interface PackageJson {
  version: string;
  bin?: Record<string, string>;
}

let packageConfig: PackageJson;

try {
  const packageJsonPath = join(__dirname, "../package.json");
  const packageJsonContent = readFileSync(packageJsonPath, "utf-8");
  packageConfig = JSON.parse(packageJsonContent);
} catch (error) {
  console.error("Failed to read package.json:", error);
  throw error;
}

/**
 * 版本号
 */
export const VERSION: string = packageConfig.version || "1.0.0";

/**
 * 脚手架命令行名字
 */
export const CLI_BIN_NAME: string =
  (packageConfig.bin && Object.keys(packageConfig.bin)[0]) || "s-cli";
