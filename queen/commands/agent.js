const os = require('os')
const { BOOTSTRAP_SWARM_RPC, GET_JOIN_ADDR_RPC, DOCKER_COMMAND_RPC, PING_EVENT } = require('../utils/schema')
const { dockerSwarmInit, dockerSwarmJoin, dockerCmd } = require('../utils/docker-cli')
const { getSwarmInfo, getNodeInfo } = require('../utils/docker-api')

const SWARM_PORT = 2377 // TODO: can it change?

module.exports = async function({logger, provideRpc, makeRpc, subscribe}) {
  subscribe(PING_EVENT, handlePing)

  // these RPC handlers will reject if not applicable to the current state
  provideRpcIf(inSwarm, GET_JOIN_ADDR_RPC, handleGetJoinAddr)
  provideRpcIf(inSwarm, DOCKER_COMMAND_RPC, handleDockerRpc)
  provideRpcIf(notInSwarm, BOOTSTRAP_SWARM_RPC, handleBootstrapSwarmRpc)

  // periodically will try to join some swarm
  setInterval(periodicActionHandler, 10000)

  // TODO: handle docker login in repositories

  logger.info("Swarm Queen Agent started")
  return;

  /************* internal functions **********/

  async function periodicActionHandler() {
    const iAmInSwarm = await inSwarm()
    if (!iAmInSwarm) {
      tryJoiningSomeSwarm()
    }
  }

  async function tryJoiningSomeSwarm() {
    logger.info("Looking for a SWARM to join - sending GET_JOIN_ADDR_RPC...")
    try {
      await joinExistingSwarm(await makeRpc(GET_JOIN_ADDR_RPC))
    }
    catch(error) {
      if (error === "NO_RPC_PROVIDER") {
        logger.info("--> No Managers available yet to join. Waiting...")
      } else {
        logger.error(`joinExistingSwarm or GET_JOIN_ADDR_RPC failed. ${error}`)
      }
    }
  }

  function handlePing() {
    logger.info("PING_EVENT received") // this log will be visible on the client side too
  }

  async function handleGetJoinAddr(_, response) {
    const joinInfo = await getJoinAddressAndTokens()
    response.send(joinInfo)
  }

  function handleDockerRpc({command, args, stdin}, response) {
    const handler = ({stdout, stderr}) => {
      response.send({stdout, stderr, hostname: os.hostname()})
    }
    logger.info(`RPC EXEC: docker ${command} ${args.join(' ')}`)
    dockerCmd({command, args, stdin}).then(handler).catch(handler)
  }

  async function handleBootstrapSwarmRpc(data, response)  {
    logger.info("Swarm Queen: bootstrapping a new swarm... ")
    await dockerSwarmInit()
    response.send("OK")
    logger.info("Swarm Queen: bootstrapped a new swarm successfully")
  }

  /************ utils *************/

  function provideRpcIf(predicate, name, handler) {
    provideRpc(name, async (data, response) => {
      response.autoAck = false // because capability check is async

      if (await predicate()) {
        response.ack()
        try {
          await handler(data, response)
        }
        catch(error) {
          logger.error(`${error.message}\n${error.stack}`)
          response.error(error.message)
        }
      } else {
        logger.info(`Rejecting ${name}`)
        response.reject()  // another node will try
      }
    })
  }

  async function inSwarm() {
    const self = await getNodeInfo()
    return !!self.Swarm.NodeID
  }

  async function notInSwarm() {
    return !(await inSwarm())
  }

  async function joinExistingSwarm({joinAddr, joinTokens}) {
    logger.info(`Joining existing swarm at ${joinAddr}...`)
    await dockerSwarmJoin(joinTokens.Manager, joinAddr)
    logger.info("Joined successfully")
  }

  async function getJoinAddressAndTokens() {
    const self = await getNodeInfo()
    const joinAddr = `${self.Swarm.NodeAddr}:${SWARM_PORT}`
    const joinTokens = (await getSwarmInfo()).JoinTokens
    return {joinAddr, joinTokens}
  }
}
