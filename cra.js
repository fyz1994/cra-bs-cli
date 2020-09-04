#!/usr/bin/env node

const shell = require("shelljs")
const inquirer = require('inquirer')
const ora = require('ora')
const chalk = require('chalk')
// const program = require('commander')

// const packageJson = require('./package.json') // 获取 package.json 中的版本号信息

// program
//   .version(packageJson.version)
//   .description(packageJson.description)
//   .option('-h, --help', '输出如何使用的提示信息')
//   .option('-h, --help', '输出如何使用的提示信息')

// program.on('--help', function () {
//   console.log("您可以点击 https://fyz1994.github.io/cra-docs/ 查看使用文档")
// });
/**
 * TODO: 失败重试
 * TODO: 网络请求初始化（应该做成子模块）
 * TODO: 初始化一份 README.md 
 * TODO: check 用户提供的名字是否符合 npm 的命名标准：validate-npm-package-name
 */
let questions = [
  {
    type: "input",
    name: "name",
    message: "您的项目要叫什么名字?",
    validate: (str) => Boolean(str.length) // 限制本项必填
  }, {
    type: "list",
    name: "lang",
    message: "使用什么语言开发?",
    choices: ['JavaScript', 'TypeScript'],
    default: 0
  }, {
    type: 'checkbox',
    name: 'UIs',
    message: '要安装哪些 UI 组件库?',
    choices: [{ name: 'antd', checked: true }, { name: 'antd-mobile' }],
    default: true
  }, {
    type: 'confirm',
    name: 'sass',
    message: '是否需要开启 sass?',
    default: true
  },
]

shell.echo('欢迎使用 oh-react 来初始化您的前端项目👏\n')

inquirer
  .prompt(questions)
  .then(answers => {
    shell.echo('\n')  // 为了美观，与前面的问题隔一行

    checkNode()       // 检测 node 环境
    checkGit()        // 检测 git 环境

    const pkgManager = getPkgManager()

    // 初始化项目
    installPackages(answers, pkgManager, errCallback).then(_ => {
      shell.echo(`\n成功为您创建了 ${chalk.green(answers.name)} 项目于 ${shell.pwd()}!`)
      shell.echo('\n现在，您可以执行以下命令启动您的程序：')
      shell.echo(`\t${pkgManager === 'yarn' ? 'yarn start' : 'npm start'}\n\nHappy hacking!`)
    })
  })

/**
 * 安装依赖项
 * 注意：JavaScript是单线程的，因此同步操作会阻止线程，包括微调器动画。尽可能使用异步操作。
 * @param {*} name 项目名称
 * @param {*} lang 开发语言
 * @param {*} UIs UI 组件库
 * @param {*} sass 是否开启 sass
 * @param {*} errCallback 错误后的回调
 */
const installPackages = async (config, pkgManager, errCallback) => {
  const { name, lang, UIs, sass } = config

  // 初始化项目
  await execShell({
    shellString: `${pkgManager === 'yarn' ? 'yarn create react-app' : 'npx create-react-app'} ${name} ${lang === 'TypeScript' ? '--typescript' : ''}`,
    shellTip: `正在为您初始化 ${lang} 项目，本过程需要一些时间，请耐心等待~`,
    succeedTip: '项目初始化成功！',
    failTip: '项目初始化失败！',
    async: true,
    silent: true,
    errCallback: () => shell.exec(`rm -rf ${name}`)
  })

  // 打开项目文件夹
  shell.cd(name)

  // 配置 sass
  if (sass) {
    await execShell({
      shellString: `${pkgManager === 'yarn' ? 'yarn add' : 'npm i -S'} node-sass`,
      shellTip: `正在为您配置 sass `,
      succeedTip: 'sass 配置成功！',
      failTip: 'sass 配置失败！',
      async: true,
      silent: true,
      errCallback: () => errCallback(name),
    })
  }

  // 安装 UI 组件库
  await Promise.all(UIs.map(ui => {
    return execShell({
      shellString: `${pkgManager === 'yarn' ? 'yarn add' : 'npm i -S'} ${ui}`,
      shellTip: `正在为您安装 ${ui} 组件库`,
      succeedTip: `${ui} 组件库安装成功！`,
      failTip: `${ui} 组件库安装失败！`,
      async: true,
      silent: true,
      errCallback: () => errCallback(name),
    })
  }))

  // 安装按需加载组件库必须的依赖项
  await execShell({
    shellString: `${pkgManager === 'yarn' ? 'yarn add' : 'npm i -S'} less less-loader react-app-rewired customize-cra babel-plugin-import`,
    shellTip: '正在为您安装按需加载组件库必须的依赖项',
    succeedTip: '按需加载相关的组件库安装成功！',
    failTip: '按需加载相关的组件库安装失败！',
    async: true,
    silent: true,
    errCallback: () => errCallback(name),
  })

  // 生成 UI 库按需加载的配置文件
  await createConfig(UIs, name, errCallback)

  // 修改 package.json
  const changeSpinner = ora('正在为您修改 package.json').start()
  changePackageJson()
  changeSpinner.succeed(chalk.green('package.json 文件修改成功！'))
}

// 检测 node 环境
const checkNode = () => {
  if (!shell.which('node')) {
    shell.echo(chalk.yellow('Warning: 您的设备上没有安装 node，如果要为您初始化一个项目，node 环境是必须的！'))
    shell.echo('您可以打开 https://nodejs.org/en/ 查看如何为您的设备配置 node 环境～') // asdadas
    shell.exit(1)
  }
}

// 检测 git 环境
const checkGit = () => {
  if (!shell.which('git')) {
    shell.echo(chalk.yellow('Warning: 您的设备上没有安装 git，它对于您后续的开发来说是必须的！'))
    shell.echo('您可以打开 https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git 查看如何为您的设备配置 git 环境～') // asdadas
    shell.exit(1)
  }
}

// 检测 node 环境
const getPkgManager = () => {
  let pkgManager = 'yarn'
  if (!shell.which('yarn')) {
    pkgManager = 'npm'
  }
  return pkgManager
}

// 依赖项安装发生错误之后的回调函数
const errCallback = (name) => {
  shell.exec(`cd .. && rm -rf ${name}`)
}

// 修改 package.json
const changePackageJson = () => {
  shell.exec("sed -i '' 's/react-scripts start/react-app-rewired start/g' package.json")
  shell.exec("sed -i '' 's/react-scripts build/react-app-rewired build/g' package.json")
  shell.exec("sed -i '' 's/react-scripts test/react-app-rewired test/g' package.json")
}

// 生成 UI 库按需加载（以及配置主题色）的配置文件
const createConfig = async (UIs = [], name, errCallback) => {

  await fetchConfig(errCallback)

  let targetFileName = 'antd.js'

  if (UIs.length === 1) {
    if (UIs.includes('antd')) {
      targetFileName = 'antd.js'
    } else if (UIs.includes('antd-mobile')) {
      targetFileName = 'antd-mobile.js'
    }
  } else if (UIs.includes('antd') && UIs.includes('antd-mobile')) {
    targetFileName = 'antd-with-antd-mobile.js'
  }
  const shellString = `cp config-overrides/${targetFileName} config-overrides.js`
  await execShell({
    shellString,
    shellTip: '正在为您生成 UI 库按需加载的配置文件',
    succeedTip: 'UI 库按需加载的配置文件生成成功！',
    failTip: 'UI 库按需加载的配置文件生成失败！',
    async: true,
    silent: true,
    errCallback: () => errCallback(name),
  })

  shell.exec('rm -rf config-overrides')
}

// 拉取配置文件
const fetchConfig = (errCallback) => {
  const spinner = ora({
    color: 'cyan',
    text: '正在为您拉取配置文件'
  }).start()

  return new Promise(resolve => {
    shell.exec(
      'git clone git@github.com:fyz1994/config-overrides.git',
      { silent: true },
      function (code, stdout, stderr) {
        if (code !== 0) {
          shell.echo(stderr)

          spinner.fail(chalk.red('配置文件拉取失败！'))
          spinner.clear()

          errCallback && errCallback()
          shell.exit(1)
        } else {
          spinner.succeed(chalk.green('配置文件拉取成功！'))
          spinner.clear()

          resolve()
        }
      }
    )
  })
}

/**
 * 执行 shell 命令
 * @param {string} shellString 命令 
 * @param {string} shellTip 执行命令时输出的日志 
 * @param {string} succeedTip 命令执行成功后输出的信息
 * @param {string} failTip 命令执行失败后输出的信息 
 * @param {string} async 是否异步执行命令 
 * @param {string} silent 是否输出命令执行的日志 
 */
const execShell = ({ shellString, shellTip, succeedTip, failTip, async = true, silent = true, errCallback }) => {
  const spinner = ora({
    color: 'cyan',
    text: shellTip
  }).start()

  return new Promise((resolve, reject) => {
    const afterFunc = (code, stderr, resolve) => {
      if (code !== 0) {
        shell.echo(chalk.red('错误日志输出如下:'))
        shell.echo(stderr)

        spinner.fail(chalk.red(failTip))
        spinner.clear()


        errCallback && errCallback()
        shell.exit(1)
        reject()
      } else {
        spinner.succeed(chalk.green(succeedTip))
        spinner.clear()

        resolve()
      }
    }
    if (async) {
      shell.exec(
        shellString,
        { silent },
        function (code, stdout, stderr) {
          afterFunc(code, stderr, resolve)
        }
      )
    } else {
      const execProcess = shell.exec(shellString, { silent, async })
      afterFunc(execProcess.code, execProcess.stderr, resolve)
    }
  })
}
