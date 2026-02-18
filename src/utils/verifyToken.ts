import jwt from 'jsonwebtoken'

export default function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET as string) as { id: string }
}
