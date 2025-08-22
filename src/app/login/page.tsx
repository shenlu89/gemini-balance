'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { IoShield, IoMail, IoLockClosed } from 'react-icons/io5'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        const error = await response.json()
        showToast(error.message || '登录失败', 'error')
      }
    } catch (error) {
      showToast('网络错误，请稍后重试', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <IoShield className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Gemini Balance</h1>
          <p className="text-gray-600 mt-2">登录到管理面板</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="邮箱"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            icon={<IoMail className="w-5 h-5 text-gray-400" />}
            required
          />

          <Input
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            icon={<IoLockClosed className="w-5 h-5 text-gray-400" />}
            required
          />

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            size="lg"
          >
            登录
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>默认账号: admin@example.com</p>
          <p>默认密码: admin123</p>
        </div>
      </div>
    </div>
  )
}