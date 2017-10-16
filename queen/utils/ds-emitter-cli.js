const os = require("os")
const { LOG_EVENT } = require('./schema')

module.exports = function({info, warn, error, fatal}, emit) {
  const hostname = os.hostname()
  const wrap = (fn, severity) => (...args) => {
    emit(LOG_EVENT, `[${hostname} ${severity}] ${args.join(' ')}`)
    fn(...args)
  }
  return {
    info: wrap(info, "INFO"),
    warn: wrap(warn, "WARN"),
    error: wrap(error, "ERROR"),
    fatal: wrap(fatal, "FATAL")
  }
}
