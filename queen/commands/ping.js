const { PING_EVENT } = require('../utils/schema')

module.exports = async function({logger, emit}) {
  logger.info("Sending PING and listening for events from a remote cluster")
  emit(PING_EVENT, 'PING')
  return new Promise(r => {})
}
