
const { BOOTSTRAP_SWARM_RPC, JOIN_MANAGER_CMD_FIELD } = require('../utils/schema')
const { dockerSwarmInit } = require('../utils/docker-cli')
const { getSwarmInfo, getSwarmNodes, getOwnSwarmStatus } = require('../utils/docker-api')

const swarmIsInitialized = record => !!record.get(JOIN_MANAGER_CMD_FIELD)

module.exports = async function({cli, provideRpc, getSwarmStateRecord}) {
  const swarmRecord = await getSwarmStateRecord()

  // when the current node becomes a Manager, it should report Swarm state into Deepstream
  setInterval(updateOwnStatusInDeepstream, 10000)

  provideRpc(BOOTSTRAP_SWARM_RPC, handleBootstrapSwarmRpc)

  cli.info("Swarm Queen Agent started")

  return;

  /************* internal functions **********/

  async function handleBootstrapSwarmRpc(data, response)  {
   if (swarmIsInitialized(record)) {
     response.reject("SWARM already initialized - bootstrap failed")
   } else {
     cli.info("Swarm Queen: going to bootstrap a new swarm ")
     await dockerSwarmInit()
     await updateOwnStatusInDeepstream()
     response.send({})
   }
 }

 async function updateOwnStatusInDeepstream() {
   swarmRecord.set({
     swarm: await safe(getSwarmInfo),
     nodes: await safe(getSwarmNodes)
   })
 }

 /************ utils *************/
 async function safe(getterFn) {
   try {
     return await getterFn()
   }
   catch(error) {
     return {Error: error.message}
   }
 }
}
