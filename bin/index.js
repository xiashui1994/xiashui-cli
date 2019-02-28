#!/usr/bin/env node

const package = require('../package.json')
const template = require('../lib/template.json')
const mini = require('./miniprogram.js')
const h5 = require('./webapp.js')
const program = require('commander')
const download = require('download-git-repo')
const inquirer = require('inquirer')
const ora = require('ora')
const chalk = require('chalk')
const logSymbols = require('log-symbols')

// -v 或者 --version 的时候会输出该版本号
program
  .version(package.version, '-v, --version')

// list 输出所有模版关键字与介绍
program
  .command('list')
  .description('所有模版信息')
  .action(() => {
    for (const key in template) {
      console.log(logSymbols.info, chalk.green(`<${key}> `), chalk.blue(`${template[key].description}`))
    }
  })

// 初始化项目
program
  .command('init <templateName> <projectName>')
  .description('初始化项目')
  .action((templateName, projectName) => {
    if (template[templateName]) {
      if (templateName === 'miniprogram') {
        mini.dmpt(ora, download, logSymbols, chalk, inquirer, projectName, template[templateName].downloadUrl)
      } else if (templateName === 'webapp') {
        h5.dht(ora, download, logSymbols, chalk, inquirer, projectName, template[templateName].downloadUrl)
      } else {
        console.log(logSymbols.error, chalk.red('模版名称不合法'))
        program.outputHelp()
      }
    } else {
      console.log(logSymbols.error, chalk.red('模版名称不合法'))
      program.outputHelp()
    }
  })

// 没有任何命令的时候输出使用帮助
if (!process.argv.slice(2).length) {
  program.outputHelp()
}

program.parse(process.argv);