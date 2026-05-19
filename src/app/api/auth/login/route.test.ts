import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/src/lib/db/prisma'
import argon2 from 'argon2'
import { generateToken } from '@/src/utils/tokenHelper'
import redisClient from '@/src/lib/redis'
import { POST, DELETE } from './route'

function makeReq(ip: string, body: any) {
  return {
    headers: { get: (name: string) => (name === 'x-forwarded-for' ? ip : null) },
    json: async () => body,
  } as unknown as Request
}

// Mocks

// Prisma
vi.mock('@/src/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn()
    }
  } 
}))
const findUniqueMock = vi.mocked(prisma.user.findUnique)

// Argon2
vi.mock('argon2', () => ({ 
  default: {
    verify: vi.fn(),
  }
}))
const verifyMock = vi.mocked(argon2.verify)

// generateToken
vi.mock('@/src/utils/tokenHelper', () => ({ 
  generateToken: vi.fn()
}))
const generateTokenMock = vi.mocked(generateToken)

// redisClient
vi.mock('@/src/lib/redis', () => ({ 
  default: {
    get: vi.fn(),
    ttl: vi.fn(),
    set: vi.fn(),
    expire: vi.fn(),
    incr: vi.fn(),
    del: vi.fn()
  }
}))
const getMock = vi.mocked(redisClient.get)
const ttlMock = vi.mocked(redisClient.ttl)
const setMock = vi.mocked(redisClient.set)
const expireMock = vi.mocked(redisClient.expire)
const incrMock = vi.mocked(redisClient.incr)
const delMock = vi.mocked(redisClient.del)

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic login checks', () => {
    it('returns 401 and error message for invalid username', async () => {
      getMock.mockResolvedValue(null)
      findUniqueMock.mockResolvedValue(null)
      incrMock.mockResolvedValue(1) // Expected output
      expireMock.mockResolvedValue(1000) // Random time (Date.now() format)

      const req = makeReq('1.2.3.4', { username: 'nope', password: 'wrong' })
      const res = await POST(req as any)
      const body = await res.json()

      expect(getMock).toHaveBeenCalledWith('login_lock_timer:1.2.3.4')
      expect(getMock).toHaveBeenCalledWith('login_attempts:1.2.3.4')
      expect(findUniqueMock).toHaveBeenCalledWith({
        where: {
          username: 'nope',
        },
      })
      expect(incrMock).toHaveBeenCalledExactlyOnceWith('login_attempts:1.2.3.4')
      expect(expireMock).toHaveBeenCalledExactlyOnceWith('login_attempts:1.2.3.4', 3600) // 3600 sec for 1 hour -> 60 * 60
      expect(res).toBeDefined()
      expect(res.status).toBe(401)
      expect(body.error).toBe('Invalid Username or Password')
    })

    it('returns 401 and error message for invalid password', async () => {
      getMock.mockResolvedValue(null)
      findUniqueMock.mockResolvedValue({ username: 'user', hashed_password: 'hashedpassword' } as any)
      incrMock.mockResolvedValue(1) // Expected output
      expireMock.mockResolvedValue(1000) // Random time (Date.now() format)
      
      verifyMock.mockImplementation(async (
        firstPassword: string, 
        secondPassword: string | Buffer
      ) => firstPassword === secondPassword.toString())

      const req = makeReq('1.2.3.4', { username: 'user', password: 'wrongpassword' })
      const res = await POST(req as any)
      const body = await res.json()

      expect(getMock).toHaveBeenCalledWith('login_lock_timer:1.2.3.4')
      expect(getMock).toHaveBeenCalledWith('login_attempts:1.2.3.4')
      expect(findUniqueMock).toHaveBeenCalledWith({
        where: {
          username: 'user',
        },
      })
      expect(incrMock).toHaveBeenCalledExactlyOnceWith('login_attempts:1.2.3.4')
      expect(expireMock).toHaveBeenCalledExactlyOnceWith('login_attempts:1.2.3.4', 3600) // 3600 sec for 1 hour -> 60 * 60
      expect(verifyMock).toHaveBeenCalledOnce()
      expect(res).toBeDefined()
      expect(res.status).toBe(401)
      expect(body.error).toBe('Invalid Username or Password')
    })

    it('returns 401 and error message for empty or invalid username type', async () => {
      getMock.mockResolvedValue(null)

      const req = makeReq('1.2.3.4', { username: 123 as any, password: 'random' })
      const res = await POST(req as any)
      const body = await res.json()

      expect(res.status).toBe(401)
      expect(body.error).toBe('Invalid Username or Password')

      const req2 = makeReq('1.2.3.4', { username: '', password: 'random' })
      const res2 = await POST(req2 as any)
      const body2 = await res2.json()

      expect(res2.status).toBe(401)
      expect(body2.error).toBe('Invalid Username or Password')
    })
    it('returns 401 and error message for empty or invalid password type', async () => {
      getMock.mockResolvedValue(null)

      const req = makeReq('1.2.3.4', { username: 'random', password: 123 as any })
      const res = await POST(req as any)
      const body = await res.json()

      expect(res.status).toBe(401)
      expect(body.error).toBe('Invalid Username or Password')

      const req2 = makeReq('1.2.3.4', { username: 'random', password: '' })
      const res2 = await POST(req2 as any)
      const body2 = await res2.json()

      expect(res2.status).toBe(401)
      expect(body2.error).toBe('Invalid Username or Password')
    })

    it('upon login, returns a 200 status, success message and a login cookie with the token', async () => {
      getMock.mockResolvedValue(null)
      findUniqueMock.mockResolvedValue({ id: '1', username: 'user', hashed_password: 'correctpassword' } as any)
      generateTokenMock.mockReturnValue('test_token')

      verifyMock.mockImplementation(async (
        firstPassword: string, 
        secondPassword: string | Buffer
      ) => firstPassword === secondPassword.toString())

      const req = makeReq('1.2.3.4', { username: 'user', password: 'correctpassword' })
      const res = await POST(req as any)
      const cookies = res.headers.getSetCookie()
      const body = await res.json()

      expect(getMock).toHaveBeenCalledWith('login_lock_timer:1.2.3.4')
      expect(getMock).toHaveBeenCalledWith('login_attempts:1.2.3.4')
      expect(findUniqueMock).toHaveBeenCalledWith({
        where: {
          username: 'user',
        },
      })
      expect(incrMock).not.toBeCalled()
      expect(expireMock).not.toBeCalled()
      expect(verifyMock).toHaveBeenCalledOnce()
      expect(delMock).toHaveBeenCalledWith('login_lock_timer:1.2.3.4')
      expect(delMock).toHaveBeenCalledWith('login_attempts:1.2.3.4')
      expect(generateTokenMock).toHaveBeenCalledExactlyOnceWith('1')
      expect(res).toBeDefined()
      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.message).toBe('Login Successful')
      expect(cookies[0]).toContain('auth_token=test_token') //cookies[0] is assumed because there is only one cookie being set here
    })
  })

  describe('Login Attempt Lock Checks', () => {
    it('returns 429 and error message with new time remaining when IP is being locked out', async () => {
      getMock.mockResolvedValueOnce('1234567890') // lockTimer has a value
      ttlMock.mockResolvedValue(300) // 5 minutes remaining

      const req = makeReq('1.2.3.4', { username: 'user', password: 'password' })
      const res = await POST(req as any)
      const body = await res.json()

      expect(getMock).toHaveBeenCalledWith('login_lock_timer:1.2.3.4')
      expect(res.status).toBe(429)
      expect(body.error).toBe('Too many attempts. Please try again in 300 seconds.')
    })

    it('returns 429 and error message with remaining time when IP is locked out', async () => {
      const mockedDateNow = 1234567890000
      vi.spyOn(Date, 'now').mockReturnValue(mockedDateNow)

      getMock.mockResolvedValueOnce(null) // consume first call
      getMock.mockResolvedValueOnce('6') // lockTimer has a value
      setMock.mockResolvedValueOnce('login_lock_key')
      expireMock.mockResolvedValueOnce(1) // random number for resolution
      delMock.mockResolvedValueOnce(1) // random number for resolution

      const req = makeReq('1.2.3.4', { username: 'user', password: 'password' })
      const res = await POST(req as any)
      const body = await res.json()

      expect(getMock).toHaveBeenCalledWith('login_lock_timer:1.2.3.4')
      expect(ttlMock).not.toBeCalled()
      expect(getMock).toHaveBeenCalledWith('login_attempts:1.2.3.4')
      expect(setMock).toHaveBeenCalledWith('login_lock_timer:1.2.3.4', Date.now().toString())
      expect(expireMock).toHaveBeenCalledWith('login_lock_timer:1.2.3.4', 10 * 60) // 10 minutes
      expect(delMock).toHaveBeenCalledWith('login_attempts:1.2.3.4')
      expect(res.status).toBe(429)
      expect(body.error).toBe('Too many attempts. Try again in 600 seconds.')
    })    
  })
})