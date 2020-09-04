#!/usr/bin/env node

const shell = require("shelljs");
const inquirer = require("inquirer");
const ora = require("ora");
const chalk = require("chalk");

/**
 * TODO: 失败重试
 * TODO: 网络请求初始化（应该做成子模块）
 * TODO: 初始化一份 README.md
 * TODO: check 用户提供的名字是否符合 npm 的命名标准：validate-npm-package-name
 */

/**
 * 安装依赖项
 * 注意：JavaScript是单线程的，因此同步操作会阻止线程，包括微调器动画。尽可能使用异步操作。
 * @param {*} name 项目名称
 * @param {*} axios 是否安装 axios
 */
const installPackages = async (config, pkgManager) => {
  const { name, axios } = config;

  // 初始化项目
  if (axios) {
    await execShell({
      shellString: `${
        pkgManager === "yarn" ? "yarn create react-app" : "npx create-react-app"
      } ${name} --template admin-axios`,
      shellTip: `正在为您初始化项目，本过程需要一些时间，请耐心等待~`,
      succeedTip: "项目初始化成功！",
      failTip: "项目初始化失败！",
      async: true,
      silent: true,
      errCallback: () => shell.exec(`rm -rf ${name}`),
    });
  } else {
    await execShell({
      shellString: `${
        pkgManager === "yarn" ? "yarn create react-app" : "npx create-react-app"
      } ${name} --template admin-bs`,
      shellTip: `正在为您初始化项目，本过程需要一些时间，请耐心等待~`,
      succeedTip: "项目初始化成功！",
      failTip: "项目初始化失败！",
      async: true,
      silent: true,
      errCallback: () => shell.exec(`rm -rf ${name}`),
    });
  }
};

// 检测 node 环境
const checkNode = () => {
  if (!shell.which("node")) {
    shell.echo(
      chalk.yellow(
        "Warning: 您的设备上没有安装 node，如果要为您初始化一个项目，node 环境是必须的！"
      )
    );
    shell.echo(
      "您可以打开 https://nodejs.org/en/ 查看如何为您的设备配置 node 环境～"
    ); // asdadas
    shell.exit(1);
  }
};

// 检测 git 环境
const checkGit = () => {
  if (!shell.which("git")) {
    shell.echo(
      chalk.yellow(
        "Warning: 您的设备上没有安装 git，它对于您后续的开发来说是必须的！"
      )
    );
    shell.echo(
      "您可以打开 https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git 查看如何为您的设备配置 git 环境～"
    ); // asdadas
    shell.exit(1);
  }
};

// 检测 node 环境
const getPkgManager = () => {
  let pkgManager = "yarn";
  if (!shell.which("yarn")) {
    pkgManager = "npm";
  }
  return pkgManager;
};

/**
 * 执行 shell 命令
 * @param {string} shellString 命令
 * @param {string} shellTip 执行命令时输出的日志
 * @param {string} succeedTip 命令执行成功后输出的信息
 * @param {string} failTip 命令执行失败后输出的信息
 * @param {string} async 是否异步执行命令
 * @param {string} silent 是否输出命令执行的日志
 */
const execShell = ({
  shellString,
  shellTip,
  succeedTip,
  failTip,
  async = true,
  silent = true,
  errCallback,
}) => {
  const spinner = ora({
    color: "cyan",
    text: shellTip,
  }).start();

  return new Promise((resolve, reject) => {
    const afterFunc = (code, stderr, resolve) => {
      if (code !== 0) {
        shell.echo(chalk.red("错误日志输出如下:"));
        shell.echo(stderr);

        spinner.fail(chalk.red(failTip));
        spinner.clear();

        errCallback && errCallback();
        shell.exit(1);
        reject();
      } else {
        spinner.succeed(chalk.green(succeedTip));
        spinner.clear();

        resolve();
      }
    };
    if (async) {
      shell.exec(shellString, { silent }, function (code, stdout, stderr) {
        afterFunc(code, stderr, resolve);
      });
    } else {
      const execProcess = shell.exec(shellString, { silent, async });
      afterFunc(execProcess.code, execProcess.stderr, resolve);
    }
  });
};

exports.installPackages = installPackages;
exports.checkNode = checkNode;
exports.checkGit = checkGit;
exports.getPkgManager = getPkgManager;
