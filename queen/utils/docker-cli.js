const { writeFileSync } = require("fs")
const tmp = require('tmp')
const {promisify} = require('util')
const { execFile } = require('child_process')
const execDocker = args => promisify(execFile)("docker", args)

module.exports = {
  dockerSwarmInit: () => execDocker(["swarm", "init", "--advertise-addr", "eth0"]),
  dockerSwarmJoin: (joinToken, joinAddr) => execDocker(["swarm", "join", "--token", joinToken, joinAddr]),
  dockerCmd: ({command, args, stdin}) => {
    // handling https://github.com/cloudcastle/swarm-queen/issues/6
    if (typeof(stdin) !== "null" && typeof(stdin) !== "undefined") {
      substituteStdinWithTempfile(args, stdin)
    }
    return execDocker([command, ...args])
  }
}

function substituteStdinWithTempfile(args, stdin) {
  args.forEach((arg, index) => {
    if (arg === "-") {
      const tmpFile = tmp.fileSync()
      writeFileSync(tmpFile.name, stdin)
      args[index] = tmpFile.name
    }
  })
}
