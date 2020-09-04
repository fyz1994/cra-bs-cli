<h1 align="center">cra-bs-cli</h1>
<p align="center">
  <a href="https://github.com/facebook/create-react-app">
  <img src="https://img.shields.io/badge/create--react--app-V3.4.1-blue" alt=""/>
  </a>
  <a href="https://www.npmjs.com/package/cra-bs-cli">
  <img src="https://img.shields.io/badge/npm-0.0.4-green" alt="Downloads"/>
  </a>  
  <img src="https://img.shields.io/badge/build-passing-brightgreen.svg" alt="Build Status"/>
</p>

对 create-react-app 进行二次定制的项目启动脚手架。自动为您执行 antd 组件库的安装，并配置按需加载组件代码和样式。

目前内置了两个模版，包含以下功能特性：

- UI 组件库 antd，已经配置好按需加载组件代码和样式
- 客户端网络请求工具 axios
- 路由 react-router
- 环境配置（开发环境/测试环境、生产环境）

> 后续会提供更多参数，例如：
>
> - 是否需要使用 typescript；
> - 是否需要使用 sass；
> - 是否是要登录页面；
> - 是否需要菜单布局；

## 何时使用

在您需要初始化一个 React 的前端项目时使用，本命令可以帮您自动执行 antd 组件库的安装，并配置按需加载组件代码和样式，加快您的开发效率～

## 使用

在命令行执行 `cra react` 命令即可～

## 安装

```
yarn global add cra-bs-cli
```

或者

```
npm i -g cra-bs-cli
```

## 其他

本命令开发时使用的各主要依赖项版本如下：

- create-react-app：3.4.1
- antd V4
