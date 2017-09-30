const docker = require('./docker')
const { JOIN_ADDR_FIELD } = require('../utils/schema')

module.exports = async function({logger, getSwarmStateRecord}) {
  logger.info("Making sure it's not a live swarm...")
  const record = await getSwarmStateRecord()

  if (record.get(JOIN_ADDR_FIELD)) {
    return docker({command: "node", args: ["ls"]}).then(() => {
      logger.error("It looks like it's a live swarm... I don't want to kill it!")
    }).catch(() => {
      return record.delete()
    })
  } else {
    return record.delete()
  }
}
