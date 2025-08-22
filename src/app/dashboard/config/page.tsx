'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { ConfigEditor } from '@/components/dashboard/ConfigEditor'
import { useToast } from '@/components/ui/Toast'

export default function ConfigPage() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      } else {
        showToast('获取配置失败', 'error')
      }
    } catch (error) {
      showToast('网络错误', 'error')
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async (newConfig: any) => {
    const response = await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || '保存失败')
    }

    const updatedConfig = await response.json()
    setConfig(updatedConfig)
  }

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">配置管理</h1>
          <p className="text-gray-600 mt-2">管理系统配置和 API 密钥</p>
        </div>

        {config && (
          <ConfigEditor
            initialConfig={config}
            onSave={saveConfig}
          />
        )}
      </div>
    </Layout>
  )
}