'use strict'
const duid = require('short-duid-js')
const fastify = require('fastify')({
  logger: true
})

// Define ShortDUID parameters
const shardId = 0
const epochStart = 1655012000n * 1000n // Not so old unix epoch timestamp
const salt = 'this is my super secret salt'

// Instantiate short-duid
const duidInstance = new duid.init(shardId, salt, epochStart)
console.log('Node with shard_id #' + shardId + ' started.')

// Main route
fastify.get('/', async (request, reply) => {
  return { name: 'ShortDUID API Server' }
})
  .get('/nduid/:count?', async (request, reply) => {
    return (duidInstance.getDUIDInt((request.params.count || 1)))
  })
  .get('/duid/:count?', async (request, reply) => {
    return (duidInstance.getDUID((request.params.count || 1)))
  })

/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
