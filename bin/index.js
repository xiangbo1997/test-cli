#!/usr/bin/env node
const chalk = require('chalk')
// console.log('Hello, cli!')
// console.log(chalk.green('init创建'))
const fs = require('fs')
const program = require('commander')
const download = require('download-git-repo')
const inquirer = require('inquirer')
const ora = require('ora')
const symbols = require('log-symbols')
const handlebars = require('handlebars')
const template = require('../template.json')
let templateName = Object.keys(template)


program
  .version(require('../package').version, '-v, --version')
  .command('create <name>')
  .action(name => {
    if (name) {
      inquirer
        .prompt([{
          type: 'list',
          message: '选择要下载的模板:',
          name: 'template',
          choices: templateName,
          filter: function (val) { // 使用filter将回答变为小写
            return val.toLowerCase();
          }
        }])
        .then(answers => {
          const lqProcess = ora('正在创建...')
          lqProcess.start()
          download(
            `direct:${template[answers['template']]}`,
            name,
            { clone: true },
            err => {
              if (err) {
                lqProcess.fail()
                console.log(symbols.error, chalk.red(err))
              } else {
                lqProcess.succeed()
                const fileName = `${name}/package.json`
                const fileName1 = `${name}/package-lock.json`
                // const meta = {
                //   name,
                //   author: '123'
                // }
                if (fs.existsSync(fileName)) {
                  fs.readFile(`${fileName}`, (err, data) => {
                    if (err) throw err;
                    let _data = JSON.parse(data.toString())
                    _data.name = name
                    _data.author = ''
                    let str = JSON.stringify(_data, null, 4);
                    fs.writeFile(`${fileName}`, str, function (err) {
                      if (err) throw err;
                    })
                  })

                  fs.readFile(`${fileName1}`, (err, data) => {
                    if (err) throw err;
                    let _data = JSON.parse(data.toString())
                    _data.name = name
                    _data.author = ''

                    let str = JSON.stringify(_data, null, 4);
                    fs.writeFile(`${fileName1}`, str, function (err) {
                      if (err) throw err;
                    })
                  })

                  /* 
                                    const content = fs.readFileSync(fileName).toString()
                                    const result = handlebars.compile(content)(meta);   
                                    fs.writeFileSync(fileName, result)  */
                }
                console.log(symbols.success, chalk.green('创建成功'))
                console.log(symbols.info, chalk.cyanBright(`建议执行以下命令`))
                console.log(symbols.info, chalk.cyanBright(`cd ${name}`))
                console.log(symbols.info, chalk.cyanBright(`npm install`))
                console.log(symbols.info, chalk.cyanBright(`npm run serve`))
              }
            }
          )
        }).catch((err)=>{
          console.log(err)
        })
    } else {
      console.log(symbols.error, chalk.red("请输入包名称"))
    }
  })
program.parse(process.argv)
