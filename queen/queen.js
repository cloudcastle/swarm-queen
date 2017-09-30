#!/usr/bin/env node

const cli = require('cli');
const promisifiedDeepstream = require('./utils/promisified-deepstream')
const COMMON_ERRORS = require('./utils/common-errors')

// TODO: introduce command "Configure Logentries"
cli.parse(null, ['agent', 'bootstrap', 'dump', 'listen', 'wait', 'clean', 'node', 'service']);
const commandHandler = require(`./commands/${cli.command}`)
const isAgent = cli.command === "agent"

function remainingArgs() {
  const [a, b, c, ...args] = process.argv
  return args
}

// TODO: better cli-logger which forwards messages to client-side via Deepstream
async function start(deepstreamUrl) {
  const { login, getReadyRecord, getReadyList, makeRpc, provideRpc, emit, subscribe, closeDeepstream } = promisifiedDeepstream(deepstreamUrl, cli)

  // edge case: we want agent's logs to be visible in the client
  // so we transmit them via Deeptstream's pub/sub
  const logger = isAgent ? require("./utils/ds-emitter-cli")(cli, emit) : cli
  let remoteNodeReady = new Promise(r => {})
  if (!isAgent) {
    remoteNodeReady = new Promise(resolve => {
      subscribe("queen-log", message => {
        cli.info(message)
        resolve(message)
      })
    })
  }

  // DB schema
  const getSwarmStateRecord = () => getReadyRecord("queen")

  try {
    await login()
    await commandHandler({logger, getSwarmStateRecord, makeRpc, provideRpc, subscribe, remoteNodeReady, command: cli.command, args: remainingArgs()})
  }
  catch(error) {
    logger.fatal(`${COMMON_ERRORS[error.toString()] || "Something Went Wrong"}\nERROR_CODE: ${error}. See README for troubleshooting`)
    exit(1)
  }

  if (!isAgent) {
    closeDeepstream()
  }
}

start(process.env.DEEPSTREAM_URL || cli.fatal("Please set DEEPSTREAM_URL env variable. See README or examples in the repo"))
