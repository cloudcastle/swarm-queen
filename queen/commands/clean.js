const docker = require('./docker')
const { JOIN_ADDR_FIELD } = require('../utils/schema')

module.exports = async function({logger, getSwarmStateRecord}) {
  logger.info("Making sure it's not a live swarm...")
  const record = await getSwarmStateRecord()

  if (record.get(JOIN_ADDR_FIELD)) {
    try {
      await docker({command: "node", args: ["ls"]})
      logger.error("It looks like it's a live swarm... I don't want to kill it! Aborting.")
      return
    }
    catch(error) {
      logger.info("OK, the SWARM is configured, but seems to be down. Removing the record")
    }
  }

  record.delete()
}
