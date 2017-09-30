const {promisify} = require('util')
const { execFile } = require('child_process')
const execDocker = args => promisify(execFile)("docker", args)

module.exports = {
  dockerSwarmInit: () => execDocker(["swarm", "init", "--advertise-addr", "eth0"]),
  dockerSwarmJoin: (joinToken, joinAddr) => execDocker(["swarm", "join", "--token", joinToken, joinAddr]),
  dockerCmd: ({command, args}) => execDocker([command, ...args])
}
