'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { IoSave, IoRefresh } from 'react-icons/io5'

const configSchema = z.object({
  API_KEYS: z.string(),
  ALLOWED_TOKENS: z.string(),
  AUTH_TOKEN: z.string(),
  BASE_URL: z.string().url(),
  TEST_MODEL: z.string(),
  MAX_FAILURES: z.number().min(1),
  MAX_RETRIES: z.number().min(1),
  TIMEOUT: z.number().min(1),
  THINKING_MODELS: z.string(),
  IMAGE_MODELS: z.string(),
  SEARCH_MODELS: z.string(),
  FILTERED_MODELS: z.string(),
  URL_CONTEXT_ENABLED: z.boolean(),
  TOOLS_CODE_EXECUTION_ENABLED: z.boolean(),
  SHOW_SEARCH_LINK: z.boolean(),
  SHOW_THINKING_PROCESS: z.boolean(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warning', 'error']),
})

type ConfigFormData = z.infer<typeof configSchema>

interface ConfigEditorProps {
  initialConfig: any
  onSave: (config: any) => Promise<void>
}

export function ConfigEditor({ initialConfig, onSave }: ConfigEditorProps) {
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      API_KEYS: JSON.stringify(initialConfig.API_KEYS || []),
      ALLOWED_TOKENS: JSON.stringify(initialConfig.ALLOWED_TOKENS || []),
      AUTH_TOKEN: initialConfig.AUTH_TOKEN || '',
      BASE_URL: initialConfig.BASE_URL || '',
      TEST_MODEL: initialConfig.TEST_MODEL || '',
      MAX_FAILURES: initialConfig.MAX_FAILURES || 10,
      MAX_RETRIES: initialConfig.MAX_RETRIES || 3,
      TIMEOUT: initialConfig.TIMEOUT || 300,
      THINKING_MODELS: JSON.stringify(initialConfig.THINKING_MODELS || []),
      IMAGE_MODELS: JSON.stringify(initialConfig.IMAGE_MODELS || []),
      SEARCH_MODELS: JSON.stringify(initialConfig.SEARCH_MODELS || []),
      FILTERED_MODELS: JSON.stringify(initialConfig.FILTERED_MODELS || []),
      URL_CONTEXT_ENABLED: initialConfig.URL_CONTEXT_ENABLED || false,
      TOOLS_CODE_EXECUTION_ENABLED: initialConfig.TOOLS_CODE_EXECUTION_ENABLED || false,
      SHOW_SEARCH_LINK: initialConfig.SHOW_SEARCH_LINK !== false,
      SHOW_THINKING_PROCESS: initialConfig.SHOW_THINKING_PROCESS !== false,
      LOG_LEVEL: initialConfig.LOG_LEVEL || 'info',
    }
  })

  const onSubmit = async (data: ConfigFormData) => {
    setLoading(true)
    try {
      // Parse JSON strings back to arrays
      const processedData = {
        ...data,
        API_KEYS: JSON.parse(data.API_KEYS),
        ALLOWED_TOKENS: JSON.parse(data.ALLOWED_TOKENS),
        THINKING_MODELS: JSON.parse(data.THINKING_MODELS),
        IMAGE_MODELS: JSON.parse(data.IMAGE_MODELS),
        SEARCH_MODELS: JSON.parse(data.SEARCH_MODELS),
        FILTERED_MODELS: JSON.parse(data.FILTERED_MODELS),
      }
      
      await onSave(processedData)
      showToast('配置已保存', 'success')
    } catch (error) {
      showToast('保存失败: ' + (error as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    reset()
    showToast('配置已重置', 'info')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">系统配置</h2>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="secondary"
            onClick={resetForm}
            disabled={!isDirty}
          >
            <IoRefresh size={16} className="mr-1" />
            重置
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!isDirty}
          >
            <IoSave size={16} className="mr-1" />
            保存配置
          </Button>
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">API 配置</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="API 密钥列表 (JSON 格式)"
              {...register('API_KEYS')}
              error={errors.API_KEYS?.message}
              placeholder='["AIzaSy...", "AIzaSy..."]'
            />
          </div>
          
          <div className="md:col-span-2">
            <Input
              label="允许的访问令牌 (JSON 格式)"
              {...register('ALLOWED_TOKENS')}
              error={errors.ALLOWED_TOKENS?.message}
              placeholder='["sk-123456", "sk-789012"]'
            />
          </div>
          
          <Input
            label="管理员令牌"
            {...register('AUTH_TOKEN')}
            error={errors.AUTH_TOKEN?.message}
          />
          
          <Input
            label="基础 URL"
            {...register('BASE_URL')}
            error={errors.BASE_URL?.message}
          />
          
          <Input
            label="测试模型"
            {...register('TEST_MODEL')}
            error={errors.TEST_MODEL?.message}
          />
          
          <Input
            label="最大失败次数"
            type="number"
            {...register('MAX_FAILURES', { valueAsNumber: true })}
            error={errors.MAX_FAILURES?.message}
          />
          
          <Input
            label="最大重试次数"
            type="number"
            {...register('MAX_RETRIES', { valueAsNumber: true })}
            error={errors.MAX_RETRIES?.message}
          />
          
          <Input
            label="请求超时 (秒)"
            type="number"
            {...register('TIMEOUT', { valueAsNumber: true })}
            error={errors.TIMEOUT?.message}
          />
        </div>
      </div>

      {/* Model Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">模型配置</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="思考模型列表 (JSON 格式)"
              {...register('THINKING_MODELS')}
              error={errors.THINKING_MODELS?.message}
              placeholder='["gemini-2.5-flash-preview-04-17"]'
            />
          </div>
          
          <div className="md:col-span-2">
            <Input
              label="图像模型列表 (JSON 格式)"
              {...register('IMAGE_MODELS')}
              error={errors.IMAGE_MODELS?.message}
              placeholder='["gemini-2.0-flash-exp"]'
            />
          </div>
          
          <div className="md:col-span-2">
            <Input
              label="搜索模型列表 (JSON 格式)"
              {...register('SEARCH_MODELS')}
              error={errors.SEARCH_MODELS?.message}
              placeholder='["gemini-2.0-flash-exp"]'
            />
          </div>
          
          <div className="md:col-span-2">
            <Input
              label="过滤模型列表 (JSON 格式)"
              {...register('FILTERED_MODELS')}
              error={errors.FILTERED_MODELS?.message}
              placeholder='["gemini-1.0-pro-vision-latest"]'
            />
          </div>
        </div>
      </div>

      {/* Feature Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">功能配置</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('URL_CONTEXT_ENABLED')}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label className="ml-2 text-sm text-gray-700">启用 URL 上下文</label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('TOOLS_CODE_EXECUTION_ENABLED')}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label className="ml-2 text-sm text-gray-700">启用代码执行工具</label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('SHOW_SEARCH_LINK')}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label className="ml-2 text-sm text-gray-700">显示搜索链接</label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('SHOW_THINKING_PROCESS')}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label className="ml-2 text-sm text-gray-700">显示思考过程</label>
          </div>
        </div>
      </div>

      {/* Logging Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">日志配置</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日志级别
            </label>
            <select
              {...register('LOG_LEVEL')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  )
}