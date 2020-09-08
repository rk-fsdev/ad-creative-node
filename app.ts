const moduleAlias = require('module-alias')

moduleAlias.addAliases({
  '@root'  : __dirname,
  '@api': `${__dirname}/api`,
  '@utils': `${__dirname}/utils`,
  '@middlewares': `${__dirname}/middlewares`,
})

import server from  './server'
import { terminate } from './utils'

const initApp = async function initApp() {
  try {
    await server.start()
  } catch (err) {
    terminate(1, 'initError')(err, err)
  }
}

initApp()

process.on('SIGINT', terminate(0, 'SIGINT'))
process.on('SIGTERM', terminate(0, 'SIGTERM'))
process.on('uncaughtException', terminate(1, 'uncaughtException'))
process.on('unhandledRejection', terminate(1, 'unhandledRejection'))