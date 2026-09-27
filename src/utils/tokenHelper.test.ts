import { afterEach, beforeEach, describe, expect, it } from "vitest"
import jwt from "jsonwebtoken"
import { generateToken, verifyToken } from "./tokenHelper"

const testSecret = "test-secret-for-token-helper"

describe("tokenHelper", () => {
  const originalJwtSecret = process.env.JWT_SECRET

  beforeEach(() => {
    process.env.JWT_SECRET = testSecret
  })

  afterEach(() => {
    process.env.JWT_SECRET = originalJwtSecret
  })

  describe("generateToken", () => {
    it("generates a token that verifies to the user ID", () => {
      const token = generateToken("user-123")

      expect(verifyToken(token)).toMatchObject({ id: "user-123" })
    })

    it("throws error when userId is not a string", () => {
      expect(() => generateToken(1234 as unknown as string)).toThrow("Invalid user ID")
    })
  })
  
  describe("verifyToken", () => {
    it("rejects a malformed token with Invalid Session", () => {
      expect(() => verifyToken("not-a-jwt")).toThrow("Invalid Session")
    })

    it("rejects an expired token with Invalid Session", () => {
      const expiredToken = jwt.sign(
        { id: "user-123" },
        testSecret,
        { expiresIn: -1 },
      )

      expect(() => verifyToken(expiredToken)).toThrow("Invalid Session")
    })
  })
})