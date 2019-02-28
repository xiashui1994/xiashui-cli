/**
 * 下载h5模版
 * @param {object} ora
 * @param {object} download
 * @param {object} logSymbols
 * @param {object} chalk
 * @param {object} inquirer
 * @param {string} projectName
 * @param {string} downloadUrl
 */

const handlebars = require('handlebars')
const fs = require('fs')

let dht = function (ora, download, logSymbols, chalk, inquirer, projectName, downloadUrl) {
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
      name: 'name',
      message: '请输入项目名称',
      default: projectName
    },{
      type: 'input',
      name: 'version',
      message: '请输入项目版本'
    },{
      type: 'input',
      name: 'description',
      message: '请输入项目描述'
    },{
      type: 'input',
      name: 'author',
      message: '请输入项目作者'
    }]).then((answers) => {
      
      // 把项目下的 package.json 文件读取出来
      const projectPath = `${projectName}/package.json`
      const projectContent = fs.readFileSync(projectPath, 'utf8')
      // 使用模板引擎把用户输入的数据解析到 package.json 文件中
      const projectResult = handlebars.compile(projectContent)(answers)
      // 解析完毕，把解析之后的结果重新写入 package.json 文件中
      fs.writeFileSync(projectPath, projectResult)
    })
  })
}
module.exports = {
  dht
}