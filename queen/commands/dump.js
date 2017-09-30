const { BOOTSTRAP_SWARM_RPC, JOIN_ADDR_FIELD } = require('../utils/schema')

module.exports = async function({logger, getSwarmStateRecord}) {
  const record = await getSwarmStateRecord()
  logger.info(JSON.stringify(record.get()))
}
