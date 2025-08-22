import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authenticateUser, createToken } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const user = await authenticateUser(email, password)
    if (!user) {
      return NextResponse.json(
        { message: '邮箱或密码错误' },
        { status: 401 }
      )
    }

    const token = await createToken(user)
    const cookieStore = await cookies()
    
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return NextResponse.json({ message: '登录成功' })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: '登录失败' },
      { status: 500 }
    )
  }
}