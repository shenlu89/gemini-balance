import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function redactKey(key: string): string {
  if (!key) return key
  if (key.length <= 12) {
    return `${key.substring(0, 3)}...${key.substring(key.length - 3)}`
  }
  return `${key.substring(0, 6)}...${key.substring(key.length - 6)}`
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

export function isValidApiKey(key: string): boolean {
  // Gemini API key format
  if (key.startsWith('AIza')) {
    return key.length >= 30
  }
  
  // OpenAI API key format
  if (key.startsWith('sk-')) {
    return key.length >= 30
  }
  
  return false
}

export function parseJsonSafely<T = any>(str: string, fallback: T): T {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'success':
    case 'active':
    case 'valid':
      return 'text-green-600 bg-green-50'
    case 'error':
    case 'failed':
    case 'invalid':
      return 'text-red-600 bg-red-50'
    case 'warning':
    case 'processing':
      return 'text-yellow-600 bg-yellow-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  if (diffHour < 24) return `${diffHour}小时前`
  if (diffDay < 7) return `${diffDay}天前`
  
  return date.toLocaleDateString('zh-CN')
}