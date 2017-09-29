const {promisify} = require('util');
const docker = require('docker-remote-api')
const request = docker({
  host: '/var/run/docker.sock'
})

const get = promisify(request.get).bind(request)

async function getSwarmInfo() {
  return get('/swarm', {json:true})
}

async function getSwarmNodes() {
  return get('/nodes', {json:true})
}

async function run() {
  console.log(await getNodes())
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
