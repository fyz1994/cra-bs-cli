#!/usr/bin/env node

const program = require("commander"); //可以解析用户输入的命令
const package = require("./package.json");
const shell = require("shelljs");
const inquirer = require("inquirer");
const ora = require("ora");
const chalk = require("chalk");

const {
  checkNode,
  checkGit,
  getPkgManager,
  installPackages,
} = require("./bin/react");

const NAME_QUESTION = {
  type: "input",
  name: "name",
  message: "您的项目要叫什么名字?",
  validate: (str) => Boolean(str.length), // 限制本项必填
};
let REACT_QUESTIONS = [
  {
    type: "confirm",
    name: "axios",
    message: "是否需要安装 axios?",
    default: true,
  },
];

shell.echo("欢迎使用 cra 来初始化您的项目👏\n");

program
  .version(package.version)
  .command("react [name]")
  .description("初始化一个 React 项目")
  .action((name) => {
    const questions = JSON.parse(JSON.stringify(REACT_QUESTIONS));
    if (!name) {
      questions.unshift(NAME_QUESTION);
    }
    inquirer.prompt(questions).then((answers) => {
      shell.echo("\n"); // 为了美观，与前面的问题隔一行

      checkNode(); // 检测 node 环境
      checkGit(); // 检测 git 环境

      const pkgManager = getPkgManager();

      // 初始化项目
      installPackages(answers, pkgManager).then((_) => {
        shell.echo(
          `\n成功为您创建了 ${chalk.green(answers.name)} 项目于 ${shell.pwd()}!`
        );
        shell.echo("\n现在，您可以执行以下命令启动您的程序：");
        shell.echo(
          `\t${
            pkgManager === "yarn" ? "yarn start" : "npm start"
          }\n\nHappy hacking!`
        );
      });
    });
  })
  .parse(process.argv);

program.parse(process.argv);
