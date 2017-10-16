const { writeFileSync } = require("fs")
const { promisify } = require('util')
const { execFile } = require('child_process')
const execDocker = args => promisify(execFile)("docker", args)

module.exports = {
  dockerSwarmInit: () => execDocker(["swarm", "init", "--advertise-addr", "eth0"]),
  dockerSwarmJoin: (joinToken, joinAddr) => execDocker(["swarm", "join", "--token", joinToken, joinAddr]),
  dockerCmd: ({command, args, stdin}) => {
    return new Promise((resolve, reject) => {
      const child = execFile("docker", [command, ...args], (error, stdout, stderr) => {
        if (error) {
          reject (error)
        } else {
          resolve({stdout, stderr})
        }
      })

      // handling https://github.com/cloudcastle/swarm-queen/issues/6
      if (typeof(stdin) !== "null" && typeof(stdin) !== "undefined") {
        child.stdin.write(stdin)
      }

      child.stdin.end()
    })
  }
}
