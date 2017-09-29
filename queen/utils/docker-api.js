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

function getOwnSwarmStatus() {
  // return new Promise((resolve, reject) => {
  //   request.get('/nodes', {json:true}, function(err, images) {
  //     if (err) {
  //       if (error.message.match(/not a swarm manager/)) {
  //         resolve({isSwarmManager: false})
  //       } else {
  //         reject(err)
  //       }
  //     } else {
  //       resolve({isSwarmManager: true})
  //     }
  //   })
  // })
}


module.exports = { getSwarmInfo, getSwarmNodes, getOwnSwarmStatus}
