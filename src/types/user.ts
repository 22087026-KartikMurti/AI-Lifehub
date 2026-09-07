export type User = {
  username: string
  id: string
  email: string
  password_reset_code: string | null
  first_name: string
  last_name: string
  hashed_password: string
  email_verified: boolean
  email_verified_at: Date | null
  password_reset_expires: Date | null
  failed_login_attempts: number
  locked_until: Date | null
  created_at: Date
  updated_at: Date
}