/**
 * 本地复制与占位符扫描时共同跳过的目录名。
 * 避免把依赖安装产物、构建产物和版本库元数据带进新项目。
 */
export const SKIP_DIR_NAMES = new Set(["node_modules", ".git", "dist", "build", "coverage"]);
