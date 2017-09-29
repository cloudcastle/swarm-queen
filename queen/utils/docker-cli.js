const docker = require('docker-remote-api')
const request = docker({
  host: '/var/run/docker.sock'
})

module.exports = {
  dockerInfo,
  dockerSwarmInit: async () => { console.log("SWARM initialized") },
  getJoinManagerCmd: async () => "docker swarm join ......",
  // getJoinWorkerCmd: async () => "docker swarm join ......"
}

function dockerInfo() {
  return new Promise(resolve => {

  })
}
