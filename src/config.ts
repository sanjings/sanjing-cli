const packageConfig = require('../package.json');
const { version, bin } = packageConfig;

/**
 * 版本号
 */
export const VERSION = version;

/**
 * 脚手架命令行名字
 */
export const CLI_BIN_NAME = bin && Object.keys(bin)[0];
