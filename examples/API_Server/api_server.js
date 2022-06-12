'use strict'
const koa = module.exports = require('koa')
const router = require('koa-router')()
const app = module.exports = koa()
const duid = require('short-duid-js')
const cluster = require('cluster')

// Define app name and port for koa-cluster
const cpus = require('os').cpus().length
app.name = 'ShortDUID'
app.node_id = 0
app.nid = process.env.NODE_APP_INSTANCE ? process.env.NODE_APP_INSTANCE : (cluster.worker.id ? cluster.worker.id : (process.pid % cpus)) // nodejs instance ID
app.shard_id = app.node_id + app.nid
app.port = 45000
app.salt = 'this is my super secret salt'
app.epoch_start = 1433116800 * 1000 // Mon, 01 Jun 2015 00:00:00 GMT

// Instantiate short-duid
const duid_instance = new duid.init(app.shard_id, app.salt, app.epoch_start)
console.log('Node with shard_id #' + app.shard_id + ' started.')

// Setup routes
router
  .get('/', function * (next) {
    this.body = {
      name: 'ShortDUID API'
    }
  })
  .get('/nduid/:count?', function * (next) {
    this.body = yield (duid_instance.getDUIDInt((this.params.count ? this.params.count : 1)))
  })
  .get('/duid/:count?', function * (next) {
    this.body = yield (duid_instance.getDUID((this.params.count ? this.params.count : 1)))
  })

// Setup middleware
app
  .use(require('koa-json')())
  .use(require('koa-response-time')())
  .use(router.routes())
  .use(router.allowedMethods())
