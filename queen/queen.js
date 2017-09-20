#!/usr/bin/env node

const cli = require('cli');
const promisifiedDeepstream = require('./utils/promisified-deepstream')
const COMMON_ERRORS = require('./utils/common-errors')

cli.parse(null, ['agent', 'bootstrap', 'ls']);
const command = require(`./commands/${cli.command}`)

async function start(deepstreamUrl) {
  const { login, getReadyRecord, getReadyList, makeRpc, provideRpc, closeDeepstream } = promisifiedDeepstream(deepstreamUrl)

  // DB schema
  const getSwarmStateRecord = () => getReadyRecord("swarm-state")
  const getSwarmNodesList = () => getReadyList("swarm-nodes")

  try {
    await login()
    await command({cli, getSwarmStateRecord, getSwarmNodesList, makeRpc, provideRpc})
  }
  catch(error) {
    cli.fatal(`${COMMON_ERRORS[error.toString()] || "Something Went Wrong"}\nERROR_CODE: ${error}. See README for troubleshooting`)
  }

  if (cli.command !== "agent") {
    closeDeepstream()
  }
}

start(process.env.DEEPSTREAM_URL || cli.fatal("Please set DEEPSTREAM_URL env variable. See README or examples in the repo"))
