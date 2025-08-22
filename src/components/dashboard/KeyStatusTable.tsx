'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { redactKey, getStatusColor } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { IoCopy, IoRefresh, IoTrash } from 'react-icons/io5'

interface KeyStatus {
  key: string
  status: 'valid' | 'invalid'
  failCount: number
  lastUsed?: Date
  model?: string
}

interface KeyStatusTableProps {
  keys: KeyStatus[]
  onRefresh: () => void
  onResetKey: (key: string) => void
  onDeleteKey: (key: string) => void
}

export function KeyStatusTable({ keys, onRefresh, onResetKey, onDeleteKey }: KeyStatusTableProps) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const { showToast } = useToast()

  const handleSelectAll = (checked: boolean) => {
    setSelectedKeys(checked ? keys.map(k => k.key) : [])
  }

  const handleSelectKey = (key: string, checked: boolean) => {
    setSelectedKeys(prev => 
      checked 
        ? [...prev, key]
        : prev.filter(k => k !== key)
    )
  }

  const copyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key)
      showToast('密钥已复制到剪贴板', 'success')
    } catch {
      showToast('复制失败', 'error')
    }
  }

  const copySelectedKeys = async () => {
    try {
      await navigator.clipboard.writeText(selectedKeys.join('\n'))
      showToast(`已复制 ${selectedKeys.length} 个密钥`, 'success')
    } catch {
      showToast('复制失败', 'error')
    }
  }

  const resetSelectedKeys = async () => {
    try {
      await Promise.all(selectedKeys.map(key => onResetKey(key)))
      showToast(`已重置 ${selectedKeys.length} 个密钥`, 'success')
      setSelectedKeys([])
    } catch {
      showToast('重置失败', 'error')
    }
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
          >
            <IoRefresh size={16} className="mr-1" />
            刷新
          </Button>
          
          {selectedKeys.length > 0 && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={copySelectedKeys}
              >
                <IoCopy size={16} className="mr-1" />
                复制选中 ({selectedKeys.length})
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={resetSelectedKeys}
              >
                <IoRefresh size={16} className="mr-1" />
                重置选中
              </Button>
            </>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          总计: {keys.length} | 有效: {keys.filter(k => k.status === 'valid').length} | 
          无效: {keys.filter(k => k.status === 'invalid').length}
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
                    checked={selectedKeys.length === keys.length && keys.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  API 密钥
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  失败次数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最后使用
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {keys.map((keyStatus) => (
                <tr key={keyStatus.key} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedKeys.includes(keyStatus.key)}
                      onChange={(e) => handleSelectKey(keyStatus.key, e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <code className="text-sm font-mono text-gray-900">
                        {redactKey(keyStatus.key)}
                      </code>
                      <button
                        onClick={() => copyKey(keyStatus.key)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="复制完整密钥"
                      >
                        <IoCopy size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                      getStatusColor(keyStatus.status)
                    )}>
                      {keyStatus.status === 'valid' ? '有效' : '无效'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {keyStatus.failCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {keyStatus.lastUsed ? keyStatus.lastUsed.toLocaleString('zh-CN') : '从未使用'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onResetKey(keyStatus.key)}
                    >
                      <IoRefresh size={14} className="mr-1" />
                      重置
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDeleteKey(keyStatus.key)}
                    >
                      <IoTrash size={14} className="mr-1" />
                      删除
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}