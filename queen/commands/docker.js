const { QUEEN_DOCKER_RPC } = require("../utils/schema")

module.exports = async function({logger, makeRpc, command, args}) {
  const result = await makeRpc(QUEEN_DOCKER_RPC, {command, args})
  if (result.stdout) {
    logger.info(`${result.hostname} said:\n${result.stdout}`)
  }
  if (result.stderr) {
    logger.error(`${result.hostname} said:\n${result.stderr}`)
  }
}
