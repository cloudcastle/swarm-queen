const { BOOTSTRAP_SWARM_RPC } = require('../utils/schema')

module.exports = async function({cli, makeRpc, getSwarmStateRecord}) {
  const record = await getSwarmStateRecord()

  if (record.get("managerToken")) {
    cli.fatal("SWARM already initialized - try `ls` command to see details")
  }

  const result = await makeRpc(BOOTSTRAP_SWARM_RPC)

  cli.info(`Bootstrap finished: ${result}`)
}
