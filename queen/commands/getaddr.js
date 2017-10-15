const { GET_JOIN_ADDR_RPC } = require('../utils/schema')

module.exports = async function({logger, makeRpc}) {
  logger.info("Fetching join addr and tokens from the cluster:")
  const joinInfo = await makeRpc(GET_JOIN_ADDR_RPC)
  console.log(JSON.stringify(joinInfo))
}
