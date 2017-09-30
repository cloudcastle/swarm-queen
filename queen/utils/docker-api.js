const { promisify } = require('util');
const { existsSync } = require('fs')
const docker = require('docker-remote-api')

const socket = existsSync('/var/run/docker.sock') && '/var/run/docker.sock' ||
               existsSync('/os/var/run/docker.sock') && '/os/var/run/docker.sock'

if (!socket) {
  throw("No docker socket found. Please mount host FS under /os directory within container")
}

const request = docker({
  host: socket
})

const get = promisify(request.get).bind(request)

function getSwarmInfo() {
  return get('/swarm', {json:true})
}

function getSwarmNodes() {
  return get('/nodes', {json:true})
}

function getNodeInfo() {
  return get('/info', {json:true})
}

module.exports = { getSwarmInfo, getSwarmNodes, getNodeInfo }
