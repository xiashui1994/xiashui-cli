/**
 * 下载小程序模版
 * @param {object} ora
 * @param {object} download
 * @param {object} logSymbols
 * @param {object} chalk
 * @param {object} inquirer
 * @param {string} projectName
 * @param {string} downloadUrl
 */
const plugin = require('../lib/plugin.json')
const handlebars = require('handlebars')
const fs = require('fs')

let dmpt = function (ora, download, logSymbols, chalk, inquirer, projectName, downloadUrl) {
  // 下载模版
  const spinner = ora('正在下载模板...').start()
  download(downloadUrl, projectName, { clone: true }, (err) => {
    if (err) {
      spinner.fail()
      console.log(logSymbols.error, chalk.red(err))
      return
    }
    spinner.succeed('模版下载成功')

    // 使用向导的方式采集用户输入的值
    inquirer.prompt([{
      type: 'input',
      name: 'projectname',
      message: '请输入项目名称',
      default: projectName
    },{
      type: 'input',
      name: 'appid',
      message: '请输入项目appid',
      validate: function (val) {
        if (!val.trim()) {
          return '请输入项目appid'
        }
        if (!val.match(/^wx/g)) {
          return '请输入正确的appid'
        }
        return true
      }
    },{
      type: 'confirm',
      name: 'wxParse',
      message: '是否使用富文本插件？(wxParse)'
    },{
      type: 'confirm',
      name: 'canvas',
      message: '是否使用图表插件？'
    },{
      type: 'list',
      name: 'canvasType',
      message: '请选择图表插件',
      choices: ['ec-canvas', 'wx-charts'],
      when: function (answers) {
        return answers.canvas
      }
    }]).then((answers) => {
      
      // 把项目下的 project.config.json 文件读取出来
      const projectPath = `${projectName}/project.config.json`
      const projectContent = fs.readFileSync(projectPath, 'utf8')
      // 使用模板引擎把用户输入的数据解析到 project.config.json 文件中
      const projectResult = handlebars.compile(projectContent)(answers)
      // 解析完毕，把解析之后的结果重新写入 project.config.json 文件中
      fs.writeFileSync(projectPath, projectResult)

      // 下载用户选择的插件
      if (answers.wxParse) {
        spinner.text = '正在下载插件'
        spinner.start()
        download(plugin.wxParse.downloadUrl, `${projectName}/plugins/wxParse`, { clone: true }, (err) => {
          if (err) {
            spinner.fail()
            console.log(logSymbols.error, chalk.red(err))
            return
          }
          spinner.succeed('wxParse下载成功')
        })
      }
      if (answers.canvas) {
        spinner.text = '正在下载插件'
        spinner.start()
        download(plugin[answers.canvasType].downloadUrl, `${projectName}/plugins/${answers.canvasType}`, { clone: true }, (err) => {
          if (err) {
            spinner.fail()
            console.log(logSymbols.error, chalk.red(err))
            return
          }
          spinner.succeed(`${answers.canvasType}下载成功`)
        })
      }
    })
  })
}
module.exports = {
  dmpt
}