const { DOCKER_COMMAND_RPC } = require("../utils/schema")

module.exports = async function({logger, makeRpc, command, args}) {
  const result = await makeRpc(DOCKER_COMMAND_RPC, {command, args})
  if (result.stdout) {
    logger.info(`${result.hostname} said:\n${result.stdout}`)
  }
  if (result.stderr) {
    logger.error(`${result.hostname} said:\n${result.stderr}`)
  }
}
