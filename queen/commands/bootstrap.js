const { BOOTSTRAP_SWARM_RPC, JOIN_ADDR_FIELD } = require('../utils/schema')

module.exports = async function({logger, makeRpc, getSwarmStateRecord}) {
  const record = await getSwarmStateRecord()

  if (record.get("JOIN_ADDR_FIELD")) {
    // TODO: detect broken swarms
    logger.fatal("SWARM already initialized - try `node ls` command to talk to Swarm, or --force to re-initialize Swarm")
  }

  const result = await makeRpc(BOOTSTRAP_SWARM_RPC, {}) // {force: true})

  logger.info(`Bootstrap finished: ${result}`)
}
