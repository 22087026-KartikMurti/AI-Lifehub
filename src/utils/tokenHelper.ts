import jwt from "jsonwebtoken"

interface TokenPayload {
  id: string
}

export function generateToken(userId: string) {
  if(typeof userId !== "string" || userId.trim().length === 0)
    throw new Error("Invalid user ID")

  const payload = { id: userId }

  const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "1d" })

  return token
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload
  } catch {
    throw new Error('Invalid Session')
  }
}