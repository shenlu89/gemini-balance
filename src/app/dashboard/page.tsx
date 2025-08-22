import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { Layout } from '@/components/layout/Layout'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { IoKey, IoWarning, IoCheckmarkCircle, IoTime } from 'react-icons/io5'

export default async function DashboardPage() {
  try {
    await requireAuth()
  } catch {
    redirect('/login')
  }

  // Mock data - in real app, fetch from database
  const stats = {
    totalKeys: 5,
    validKeys: 3,
    invalidKeys: 2,
    totalRequests: 1234,
    successRate: 95.2,
    avgLatency: 245,
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">仪表板</h1>
          <p className="text-gray-600 mt-2">Gemini Balance 系统概览</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="API 密钥总数"
            value={stats.totalKeys}
            icon={<IoKey size={24} />}
          />
          
          <StatsCard
            title="有效密钥"
            value={stats.validKeys}
            subtitle={`${((stats.validKeys / stats.totalKeys) * 100).toFixed(1)}%`}
            icon={<IoCheckmarkCircle size={24} />}
          />
          
          <StatsCard
            title="无效密钥"
            value={stats.invalidKeys}
            subtitle={`${((stats.invalidKeys / stats.totalKeys) * 100).toFixed(1)}%`}
            icon={<IoWarning size={24} />}
          />
          
          <StatsCard
            title="平均延迟"
            value={`${stats.avgLatency}ms`}
            icon={<IoTime size={24} />}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">快速操作</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/dashboard/config"
              className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <IoKey className="w-8 h-8 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">配置管理</h3>
              <p className="text-sm text-gray-600 mt-1">管理 API 密钥和系统配置</p>
            </a>
            
            <a
              href="/dashboard/keys"
              className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <IoCheckmarkCircle className="w-8 h-8 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">密钥监控</h3>
              <p className="text-sm text-gray-600 mt-1">查看密钥状态和使用情况</p>
            </a>
            
            <a
              href="/dashboard/logs"
              className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <IoWarning className="w-8 h-8 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">错误日志</h3>
              <p className="text-sm text-gray-600 mt-1">查看和管理错误日志</p>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}