const { LOG_EVENT } = require("../utils/schema")

module.exports = function({logger, remoteNodeReady}) {
  logger.info("Waiting for any event from a remote node...")

  // TODO: 5 minutes timeout
  return remoteNodeReady;
}
