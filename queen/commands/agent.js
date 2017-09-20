const { BOOTSTRAP_SWARM_RPC } = require('../utils/schema')
const { dockerSwarmInit } = require('../utils/docker-cli')

module.exports = async function({cli, provideRpc, getSwarmStateRecord}) {
  const record = await getSwarmStateRecord()

  provideRpc(BOOTSTRAP_SWARM_RPC, (data, response) => {
    if (record.get("managerToken")) {
      response.reject("SWARM already initialized - bootstrap failed")
    } else {
      const result = dockerSwarmInit()
      response.send(result)
    }
  })

  cli.info("Swarm Queen Agent started")
}
