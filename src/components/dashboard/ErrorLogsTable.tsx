'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { redactKey, formatRelativeTime } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { IoEye, IoTrash, IoCopy } from 'react-icons/io5'

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

interface ErrorLogsTableProps {
  logs: ErrorLog[]
  onRefresh: () => void
  onDeleteLog: (id: number) => void
}

export function ErrorLogsTable({ logs, onRefresh, onDeleteLog }: ErrorLogsTableProps) {
  const [selectedLogs, setSelectedLogs] = useState<number[]>([])
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const { showToast } = useToast()

  const handleSelectAll = (checked: boolean) => {
    setSelectedLogs(checked ? logs.map(log => log.id) : [])
  }

  const handleSelectLog = (id: number, checked: boolean) => {
    setSelectedLogs(prev => 
      checked 
        ? [...prev, id]
        : prev.filter(logId => logId !== id)
    )
  }

  const showLogDetail = (log: ErrorLog) => {
    setSelectedLog(log)
    setIsDetailModalOpen(true)
  }

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast(`${label}已复制到剪贴板`, 'success')
    } catch {
      showToast('复制失败', 'error')
    }
  }

  const copyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key)
      showToast('API密钥已复制到剪贴板', 'success')
    } catch {
      showToast('复制失败', 'error')
    }
  }

  const deleteSelectedLogs = async () => {
    try {
      await Promise.all(selectedLogs.map(id => onDeleteLog(id)))
      showToast(`已删除 ${selectedLogs.length} 条日志`, 'success')
      setSelectedLogs([])
      onRefresh()
    } catch {
      showToast('删除失败', 'error')
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefresh}
            >
              刷新
            </Button>
            
            {selectedLogs.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={deleteSelectedLogs}
              >
                <IoTrash size={16} className="mr-1" />
                删除选中 ({selectedLogs.length})
              </Button>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            总计: {logs.length} 条错误日志
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedLogs.length === logs.length && logs.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API 密钥
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    错误类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    错误码
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    模型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLogs.includes(log.id)}
                        onChange={(e) => handleSelectLog(log.id, e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <code className="text-sm font-mono text-gray-900">
                          {redactKey(log.geminiKey || '')}
                        </code>
                        {log.geminiKey && (
                          <button
                            onClick={() => copyKey(log.geminiKey!)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="复制完整密钥"
                          >
                            <IoCopy size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.errorType || '未知'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.errorCode || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.modelName || '未知'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatRelativeTime(log.requestTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => showLogDetail(log)}
                      >
                        <IoEye size={14} className="mr-1" />
                        详情
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDeleteLog(log.id)}
                      >
                        <IoTrash size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="错误日志详情"
        size="xl"
      >
        {selectedLog && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API 密钥
                </label>
                <div className="flex items-center space-x-2">
                  <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {selectedLog.geminiKey || '无'}
                  </code>
                  {selectedLog.geminiKey && (
                    <button
                      onClick={() => copyText(selectedLog.geminiKey!, 'API密钥')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <IoCopy size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  错误类型
                </label>
                <span className="text-sm text-red-600 font-medium">
                  {selectedLog.errorType || '未知'}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  错误码
                </label>
                <span className="text-sm text-gray-900">
                  {selectedLog.errorCode || '-'}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  模型名称
                </label>
                <span className="text-sm text-gray-900">
                  {selectedLog.modelName || '未知'}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  错误日志
                </label>
                {selectedLog.errorLog && (
                  <button
                    onClick={() => copyText(selectedLog.errorLog!, '错误日志')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <IoCopy size={16} />
                  </button>
                )}
              </div>
              <pre className="text-sm bg-gray-100 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {selectedLog.errorLog || '无'}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  请求消息
                </label>
                {selectedLog.requestMsg && (
                  <button
                    onClick={() => copyText(JSON.stringify(selectedLog.requestMsg, null, 2), '请求消息')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <IoCopy size={16} />
                  </button>
                )}
              </div>
              <pre className="text-sm bg-gray-100 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {selectedLog.requestMsg ? JSON.stringify(selectedLog.requestMsg, null, 2) : '无'}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}