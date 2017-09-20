module.exports = {
  dockerSwarmInit: async () => { console.log("SWARM initialized") },
  dockerInfo: async () => ({ inSwarm: true, manager: false }),
  getJoinManagerCmd: async () => "docker swarm join ......",
  getJoinWorkerCmd: async () => "docker swarm join ......"
}
