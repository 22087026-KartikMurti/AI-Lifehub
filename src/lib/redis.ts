import { createClient } from 'redis'

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 10000 // 10 second connection timeout
  }
})

redisClient.on('error', (err) => console.error('Redis error: ', err))

await redisClient.connect()

export default redisClient