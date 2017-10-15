const { PING_EVENT } = require('../utils/schema')

module.exports = async function({logger, emit}) {
  logger.info("Sending PING and listening for events from a remote cluster")
  const ping = () => emit(PING_EVENT, 'PING')
  setInterval(ping, 3000)
  ping()
  
  return new Promise(r => {})
}
