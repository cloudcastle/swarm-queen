const { BOOTSTRAP_SWARM_RPC } = require('../utils/schema')

module.exports = async function({logger, makeRpc}) {
  const result = await makeRpc(BOOTSTRAP_SWARM_RPC, {})
  logger.info(`Bootstrap finished: ${result}`)
}
