# Gemini Balance Next.js

基于 Next.js 15 的 Gemini Balance 项目复刻版本，支持 Vercel 一键部署。

## 技术栈

- **Next.js 15** - React 全栈框架
- **Tailwind CSS v4** - 现代化 CSS 框架
- **Turso** - 边缘数据库 (SQLite)
- **Drizzle ORM** - 类型安全的 ORM
- **React Icons** - 图标库
- **Bun** - 快速的 JavaScript 运行时

## 功能特性

- ✅ **多密钥负载均衡** - 支持多个 Gemini API 密钥轮询
- ✅ **实时监控面板** - 密钥状态和使用情况监控
- ✅ **配置管理** - 可视化配置编辑器
- ✅ **错误日志** - 详细的错误日志记录和查看
- ✅ **OpenAI 兼容** - 支持 OpenAI API 格式
- ✅ **Gemini 原生** - 支持 Gemini 原生 API 格式
- ✅ **响应式设计** - 完美适配移动端和桌面端
- ✅ **一键部署** - 支持 Vercel 零配置部署

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd gemini-balance-nextjs
```

### 2. 安装依赖

```bash
bun install
```

### 3. 配置环境变量

复制 `.env.example` 到 `.env.local` 并填写配置：

```bash
cp .env.example .env.local
```

### 4. 设置数据库

```bash
# 生成数据库迁移
bun run db:generate

# 执行迁移
bun run db:migrate
```

### 5. 启动开发服务器

```bash
bun run dev
```

访问 http://localhost:3000

## 部署到 Vercel

### 1. 准备 Turso 数据库

1. 注册 [Turso](https://turso.tech/) 账号
2. 创建数据库：
   ```bash
   turso db create gemini-balance
   ```
3. 获取数据库 URL 和认证令牌：
   ```bash
   turso db show gemini-balance
   turso db tokens create gemini-balance
   ```

### 2. 部署到 Vercel

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量：
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `JWT_SECRET`
   - `API_KEYS`
   - `ALLOWED_TOKENS`
   - 其他配置项...

4. 部署完成！

## API 端点

### Gemini 原生格式

- `GET /api/gemini/v1beta/models` - 获取模型列表
- `POST /api/gemini/v1beta/models/{model}:generateContent` - 生成内容

### OpenAI 兼容格式

- `GET /api/v1/models` - 获取模型列表
- `POST /api/v1/chat/completions` - 聊天补全

### 管理 API

- `GET /api/config` - 获取配置
- `PUT /api/config` - 更新配置
- `GET /api/keys` - 获取密钥状态
- `GET /api/logs/errors` - 获取错误日志

## 配置说明

主要配置项说明：

- `API_KEYS` - Gemini API 密钥列表
- `ALLOWED_TOKENS` - 允许访问的令牌列表
- `AUTH_TOKEN` - 管理员令牌
- `BASE_URL` - Gemini API 基础 URL
- `MAX_FAILURES` - 密钥最大失败次数
- `THINKING_MODELS` - 支持思考功能的模型
- `IMAGE_MODELS` - 支持图像功能的模型
- `SEARCH_MODELS` - 支持搜索功能的模型

## 开发

### 数据库操作

```bash
# 查看数据库
bun run db:studio

# 生成新迁移
bun run db:generate

# 执行迁移
bun run db:migrate
```

### 项目结构

```
src/
├── app/                 # Next.js App Router
├── components/          # React 组件
│   ├── ui/             # 基础 UI 组件
│   ├── layout/         # 布局组件
│   └── dashboard/      # 仪表板组件
├── lib/                # 工具库
│   ├── db/             # 数据库相关
│   ├── auth.ts         # 认证逻辑
│   ├── config.ts       # 配置管理
│   └── utils.ts        # 工具函数
└── middleware.ts       # Next.js 中间件
```

## 许可证

本项目采用 [CC BY-NC 4.0](LICENSE) 协议，禁止商业用途。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 支持

如果这个项目对你有帮助，请给个 ⭐️ Star！