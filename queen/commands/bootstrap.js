const { BOOTSTRAP_SWARM_RPC, JOIN_MANAGER_CMD_FIELD } = require('../utils/schema')

module.exports = async function({cli, makeRpc, getSwarmStateRecord}) {
  const record = await getSwarmStateRecord()

  if (record.get("JOIN_MANAGER_CMD_FIELD")) {
    // TODO: detect broken swarms
    cli.fatal("SWARM already initialized - try `node ls` command to talk to Swarm, or --force to re-initialize Swarm")
  }

  const result = await makeRpc(BOOTSTRAP_SWARM_RPC)

  cli.info(`Bootstrap finished: ${result}`)
}
