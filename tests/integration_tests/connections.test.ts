import 'dotenv/config'
import { describe, it, expect, afterAll } from 'vitest'
import { Resend } from 'resend'
import { prisma } from '@/src/lib/db/prisma'
import redisClient from '@/src/lib/redis'

// const runIntegrationTests = process.env.RUN_INTEGRATION_TESTS === 'true'

describe('External service connections', () => {
  it('connects to postgreSQL through Prisma', async () => {
    const result = await prisma.$queryRaw<{ result: number }[]>`SELECT 1 AS result`
    
    expect(result[0].result).toBe(1)
  })

  it('connects to Redis', async () => {
    const key = `connection-test:${Date.now()}`

    expect(redisClient.isReady).toBe(true)

    await redisClient.set(key, 'ok', { EX: 30 })
    await expect(redisClient.get(key)).resolves.toBe('ok')
    await redisClient.del(key)
  })

  it('connects to Resend API', async () => {
    const resend = new Resend(process.env.RESEND_API_KEY)

    const response = await resend.domains.list()

    expect(response.error).toBeNull()
  })

  it('connects to the OpenRouter AI API', async () => {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
    })

    expect(response.ok).toBe(true)
  })

  afterAll(async () => {
    await prisma.$disconnect()

    if(redisClient.isOpen) {
      await redisClient.quit()
    }
  })
})