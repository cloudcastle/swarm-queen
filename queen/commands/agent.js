const os = require('os')
const { BOOTSTRAP_SWARM_RPC, JOIN_ADDR_FIELD, JOIN_TOKENS_FIELD, QUEEN_DOCKER_RPC } = require('../utils/schema')
const { dockerSwarmInit, dockerSwarmJoin, dockerCmd } = require('../utils/docker-cli')
const { getSwarmInfo, getSwarmNodes, getNodeInfo } = require('../utils/docker-api')

const swarmIsInitialized = record => !!record.get(JOIN_ADDR_FIELD)

module.exports = async function({logger, provideRpc, getSwarmStateRecord}) {
  let swarmRecord = await getSwarmStateRecord()

  // when the current node becomes a Manager, it should report Swarm state into Deepstream
  setInterval(doPeriodicActions, 10000)

  provideRpc(BOOTSTRAP_SWARM_RPC, handleBootstrapSwarmRpc)
  provideRpc(QUEEN_DOCKER_RPC, handleDockerRpc)

  logger.info("Swarm Queen Agent started")

  return;

  /************* internal functions **********/

  function handleDockerRpc({command, args}, response) {
    const handler = ({stdout, stderr}) => {
      response.send({stdout, stderr, hostname: os.hostname()})
    }
    logger.info(`RPC EXEC: docker ${command} ${args.join(' ')}`)
    return dockerCmd({command, args}).then(handler).catch(handler)
  }

  async function handleBootstrapSwarmRpc(data, response)  {
    if (swarmIsInitialized(swarmRecord) && !(data || {}).force) {
      response.error("SWARM already initialized - bootstrap failed")
    } else {
      logger.info("Swarm Queen: bootstrapping a new swarm... ")
      try {
        await dockerSwarmInit()
        response.send("OK")
        logger.info("Swarm Queen: became a leader in a new swarm")
      }
      catch(error) {
        logger.error(error.message)
        response.error(error.message)
      }
    }
  }

  async function doPeriodicActions() {
    if (swarmRecord.isDestroyed) {
      logger.info("Swarm record was destroyed on the server. Creating a new one")
      swarmRecord = await getSwarmStateRecord()
    }

    const self = await getNodeInfo()
    const inSwarm = () => !!self.Swarm.NodeID

    if (inSwarm()) {
      await putLeaderInfoInDeepstreamIfLeader(self)
    } else {
      swarmIsInitialized(swarmRecord) ? joinExistingSwarm(self) : logger.info("Waiting for bootstrap or a Swarm to join...")
    }
  }

  /************ utils *************/

  async function joinExistingSwarm(self) {
    const leader = swarmRecord.get(JOIN_ADDR_FIELD)
    const tokens = swarmRecord.get("joinTokens")
    try {
      logger.info(`Joining existing swarm at ${leader}...`)
      await dockerSwarmJoin(tokens.Manager, leader)
      logger.info("Joined successfully")
    }
    catch(error) {
      logger.error(error.message)
    }
  }

  function deepEq(a, b) {
    return JSON.stringify(a) === JSON.stringify(b)
  }

  async function putLeaderInfoInDeepstreamIfLeader(self) {
    const nodes = await safe(getSwarmNodes)
    if (self.Swarm.NodeID === leaderId(nodes)) {
      const joinAddr = `${self.Swarm.NodeAddr}:2377`
      const joinTokens = (await safe(getSwarmInfo)).JoinTokens
      if (swarmRecord.get(JOIN_ADDR_FIELD) !== joinAddr || !deepEq(swarmRecord.get(JOIN_TOKENS_FIELD), joinTokens)) {
        logger.info(`Registering leader in Deepstream: ${joinAddr}`)
        swarmRecord.set({
          [JOIN_ADDR_FIELD]: joinAddr,
          [JOIN_TOKENS_FIELD]: joinTokens
        })
      }
    }
  }

  async function safe(getterFn) {
    try {
      return await getterFn()
    }
    catch(error) {
      return {Error: error.message}
    }
  }

  function leaderId(nodes) {
    for (node of nodes) {
      if (node.ManagerStatus.Leader) {
        return node.ID
      }
    }
    return null // nothing found
  }
}
