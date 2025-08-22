import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { db } from './db'
import { users } from './db/schema'
import { eq } from 'drizzle-orm'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key')

export interface JWTPayload {
  userId: number
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as JWTPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  
  if (!token) return null
  
  return verifyToken(token)
}

export async function requireAuth(): Promise<JWTPayload> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function createUser(email: string, password: string, role: string = 'admin') {
  const passwordHash = await hashPassword(password)
  
  const [user] = await db.insert(users).values({
    email,
    passwordHash,
    role,
  }).returning()
  
  return user
}

export async function authenticateUser(email: string, password: string): Promise<JWTPayload | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email))
  
  if (!user) return null
  
  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) return null
  
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
  }
}