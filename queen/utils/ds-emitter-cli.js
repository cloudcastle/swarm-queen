const os = require("os")

module.exports = function({info, warn, error, fatal}, emit) {
  const hostname = os.hostname()
  const wrap = (fn, severity) => (...args) => {
    emit(`queen-log`, `[${hostname} ${severity}] ${args.join(' ')}`)
    fn(...args)
  }
  return {
    info: wrap(info, "INFO"),
    warn: wrap(warn, "WARN"),
    error: wrap(error, "ERROR"),
    fatal: wrap(fatal, "FATAL")
  }
}
