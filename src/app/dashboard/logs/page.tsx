'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { ErrorLogsTable } from '@/components/dashboard/ErrorLogsTable'
import { useToast } from '@/components/ui/Toast'

interface ErrorLog {
  id: number
  geminiKey?: string
  modelName?: string
  errorType?: string
  errorLog?: string
  errorCode?: number
  requestMsg?: any
  requestTime: Date
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs/errors')
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs?.map((log: any) => ({
          ...log,
          requestTime: new Date(log.requestTime)
        })) || [])
      } else {
        showToast('获取错误日志失败', 'error')
      }
    } catch (error) {
      showToast('网络错误', 'error')
    } finally {
      setLoading(false)
    }
  }

  const deleteLog = async (id: number) => {
    try {
      const response = await fetch(`/api/logs/errors/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        showToast('日志已删除', 'success')
        fetchLogs()
      } else {
        showToast('删除失败', 'error')
      }
    } catch (error) {
      showToast('网络错误', 'error')
    }
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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">错误日志</h1>
          <p className="text-gray-600 mt-2">查看和管理系统错误日志</p>
        </div>

        <ErrorLogsTable
          logs={logs}
          onRefresh={fetchLogs}
          onDeleteLog={deleteLog}
        />
      </div>
    </Layout>
  )
}