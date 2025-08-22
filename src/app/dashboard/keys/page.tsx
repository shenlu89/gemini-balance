'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { KeyStatusTable } from '@/components/dashboard/KeyStatusTable'
import { useToast } from '@/components/ui/Toast'
import { IoKey, IoCheckmarkCircle, IoWarning, IoTime } from 'react-icons/io5'

interface KeyStatus {
  key: string
  status: 'valid' | 'invalid'
  failCount: number
  lastUsed?: Date
  model?: string
}

export default function KeysPage() {
  const [keys, setKeys] = useState<KeyStatus[]>([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    fetchKeys()
  }, [])

  const fetchKeys = async () => {
    try {
      const response = await fetch('/api/keys')
      if (response.ok) {
        const data = await response.json()
        setKeys(data.keys || [])
      } else {
        showToast('获取密钥状态失败', 'error')
      }
    } catch (error) {
      showToast('网络错误', 'error')
    } finally {
      setLoading(false)
    }
  }

  const resetKey = async (key: string) => {
    try {
      const response = await fetch(`/api/keys/${encodeURIComponent(key)}/reset`, {
        method: 'POST',
      })
      
      if (response.ok) {
        showToast('密钥已重置', 'success')
        fetchKeys()
      } else {
        showToast('重置失败', 'error')
      }
    } catch (error) {
      showToast('网络错误', 'error')
    }
  }

  const deleteKey = async (key: string) => {
    if (!confirm('确定要删除这个密钥吗？')) return
    
    try {
      const response = await fetch(`/api/keys/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        showToast('密钥已删除', 'success')
        fetchKeys()
      } else {
        showToast('删除失败', 'error')
      }
    } catch (error) {
      showToast('网络错误', 'error')
    }
  }

  const validKeys = keys.filter(k => k.status === 'valid')
  const invalidKeys = keys.filter(k => k.status === 'invalid')

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">密钥监控</h1>
          <p className="text-gray-600 mt-2">监控 API 密钥状态和使用情况</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="总密钥数"
            value={keys.length}
            icon={<IoKey size={24} />}
          />
          
          <StatsCard
            title="有效密钥"
            value={validKeys.length}
            subtitle={`${keys.length > 0 ? ((validKeys.length / keys.length) * 100).toFixed(1) : 0}%`}
            icon={<IoCheckmarkCircle size={24} />}
          />
          
          <StatsCard
            title="无效密钥"
            value={invalidKeys.length}
            subtitle={`${keys.length > 0 ? ((invalidKeys.length / keys.length) * 100).toFixed(1) : 0}%`}
            icon={<IoWarning size={24} />}
          />
          
          <StatsCard
            title="平均失败次数"
            value={keys.length > 0 ? (keys.reduce((sum, k) => sum + k.failCount, 0) / keys.length).toFixed(1) : 0}
            icon={<IoTime size={24} />}
          />
        </div>

        {/* Key Status Table */}
        <KeyStatusTable
          keys={keys}
          onRefresh={fetchKeys}
          onResetKey={resetKey}
          onDeleteKey={deleteKey}
        />
      </div>
    </Layout>
  )
}