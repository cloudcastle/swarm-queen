const deepstream = require('deepstream.io-client-js')

module.exports = function promisifiedDeepstream(url, logger = console) {
  const ds = deepstream(url)

  return {
    login(creds) {
      return new Promise((resolve, reject) => {
        ds.login(creds, (success, data) => {
          if (success) {
            ds.on( 'error', error => {
              logger.error(`ERROR: deepstream said: ${error}`)
            })
            resolve(ds);
          } else {
            logger.error(data)
            reject(`DeepStream Login failed: ${data.reason}`)
          }
        })
      })
    },

    getReadyRecord: path => withTimeout(new Promise(r => ds.record.getRecord(path).whenReady(r))),

    getReadyList: name => withTimeout(new Promise(r => { const list = ds.record.getList(name); list.whenReady(() => r(list))})),

    getUid: () => ds.getUid(),

    provideRpc: (name, cb) => ds.rpc.provide(name, cb),
    makeRpc: (name, data) => new Promise((r, f) => ds.rpc.make(name, data, (error, result) => error ? f(error) : r(result))),

    subscribe: ds.event.subscribe.bind(ds.event),
    emit: ds.event.emit.bind(ds.event),

    closeDeepstream: () => ds.close()
  }

}



function withTimeout(promise) {
  return new Promise((resolve, reject) => {
    const timo = setTimeout(function() {
      reject("ERROR: TIMEOUT")
    }, 10000)

    promise.then(data => {
      clearTimeout(timo)
      resolve(data)
    }).catch(reject)
  })
}
