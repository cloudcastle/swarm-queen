const getStdin = require('get-stdin')
const { DOCKER_COMMAND_RPC } = require("../utils/schema")

module.exports = async function({logger, makeRpc, command, args}) {
  // "docker secret create SECRET_NAME -" requires STDIN
  let stdin = null
  if (command === "secret" && args[0] === "create") {
    args[2] = "-"
    stdin = await getStdin()
    console.log("--> Sending STDIN to remote Docker...")
  }

  const result = await makeRpc(DOCKER_COMMAND_RPC, {command, args, stdin})
  if (result.stdout) {
    logger.info(`${result.hostname} said:\n${result.stdout}`)
  }
  if (result.stderr) {
    logger.error(`${result.hostname} said:\n${result.stderr}`)
  }
}
