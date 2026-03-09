import jwt from "jsonwebtoken"

export function generateToken(userId: string) {
  const payload = { id: userId }

  const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "1d" })

  return token
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as { id: string }
  } catch {
    throw new Error('Invalid Session')
  }
}