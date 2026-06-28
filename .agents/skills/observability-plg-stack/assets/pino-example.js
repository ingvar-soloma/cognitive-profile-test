const logger = require('pino')()

// 1. Basic logging
logger.info('hello world')

// 2. Child loggers (useful for passing trace_id)
const child = logger.child({ trace_id: '12345-abcde' })
child.info('Processing RAG pipeline step 1')
child.debug({ step: 'context_retrieval', duration_ms: 42 })

// 3. Merging objects (Structured logging)
logger.info({
  user_id: 1024,
  action: 'matchmaking',
  status: 'success'
}, 'User matched successfully')

// 4. Error logging
try {
  throw new Error('Database connection failed')
} catch (err) {
  logger.error(err, 'Failed to connect to primary DB')
}
