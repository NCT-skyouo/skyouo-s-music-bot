const chalk = require('chalk')
const stamp = require('time-stamp')

class Logger {
  constructor (caller = 'DEFAULT', debug = 0, ignore = []) {
    this.caller = caller
    this.debugging = debug
    this.ignore = ignore
  }

  debug () {
    if (!this.debugging) return
    return this.log(this.caller, arguments, 'DEBUG', chalk.grey)
  }

  /**
   * @description 多用於提示用戶, 進程正常
   */
  ok () {
    return this.log(this.caller, arguments, 'OK', chalk.greenBright)
  }

  /**
   * @description 多用於提示用戶, 指令運行
   */
  info () {
    return this.log(this.caller, arguments, 'INFO', chalk.blueBright)
  }

  /**
   * @description 多用於提示用戶, 依賴過期, 版本更新
   */
  notice () {
    return this.log(this.caller, arguments, 'NOTICE', chalk.blue)
  }

  /**
   * @description 多用於警告用戶, 進程錯誤, 但是不影響系統
   */
  warn () {
    return this.log(this.caller, arguments, 'WARN', chalk.yellow)
  }

  /**
   * @description 多用於警告用戶, 進程錯誤, 且影響系統
   */
  fatal () {
    return this.log(this.caller, arguments, 'FATAL', chalk.redBright)
  }

  error () {
    return this.log(this.caller, arguments, 'ERROR', chalk.red)
  }

  trace () {
    return this.log(this.caller, arguments, 'TRACE', chalk.red)
  }

  showErr (e) {
    for (const line of e.toString().split('\n')) this.error(line)
    for (const line of e.stack.replace(e.toString(), '').split('\n')) this.trace(line)
  }

  log (caller, args, level, color) {
    if (this.ignore.includes(level)) return this
    console.log(`[${stamp('HH:mm:ss', new Date(), 8)}] [${color(`${caller}/${level}`)}] ${Array.from(args)}`)
    return this
  }
}

module.exports = Logger
