# 自动化GEO智能评估平台 - 部署指南

## 📋 概述

本文档提供了自动化GEO智能评估平台的完整部署指南，包括本地开发环境设置、Supabase数据库配置和Vercel生产环境部署。

## 🏗️ 系统架构

- **前端**: React 18 + TypeScript + Vite + Tailwind CSS
- **后端**: Express.js + TypeScript + Node.js
- **数据库**: PostgreSQL (Supabase)
- **部署**: Vercel (全栈部署)
- **认证**: JWT + Supabase Auth

## 📋 部署前准备

### 1. 环境要求

- Node.js 18+ 
- npm 或 pnpm
- Git
- Vercel CLI (可选，用于命令行部署)

### 2. 账户准备

- [Supabase](https://supabase.com/) 账户
- [Vercel](https://vercel.com/) 账户
- [GitHub](https://github.com/) 账户（推荐）

## 🗄️ Supabase 数据库配置

### 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://app.supabase.com/)
2. 点击 "New Project"
3. 选择组织并填写项目信息：
   - **Name**: geo-intelligent-platform
   - **Database Password**: 设置强密码
   - **Region**: 选择最近的区域
4. 等待项目创建完成（约2-3分钟）

### 2. 获取数据库连接信息

在项目仪表板中：

1. 进入 **Settings** → **Database**
2. 复制以下信息：
   - **Host**: `db.xxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: 你设置的密码

3. 进入 **Settings** → **API**
4. 复制以下密钥：
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role secret**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. 构建 DATABASE_URL

使用以下格式构建连接字符串：

```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

示例：
```
postgresql://postgres:mypassword123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

## ⚙️ 环境变量配置

### 1. 创建 .env 文件

在项目根目录创建 `.env` 文件：

```bash
# 数据库配置
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# Supabase 配置
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# 服务器配置
PORT=3001
NODE_ENV=production

# 邮件配置（可选）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 外部服务配置（可选）
OPENAI_API_KEY=sk-your-openai-api-key
GOOGLE_SEARCH_API_KEY=your-google-api-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id

# AI 代理配置（可选）
AI_AGENT_ENABLED=true
AI_AGENT_MODEL=gpt-4
AI_AGENT_MAX_TOKENS=2000
```

### 2. 环境变量说明

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `DATABASE_URL` | ✅ | PostgreSQL 数据库连接字符串 |
| `SUPABASE_URL` | ✅ | Supabase 项目 URL |
| `SUPABASE_ANON_KEY` | ✅ | Supabase 匿名访问密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase 服务角色密钥 |
| `JWT_SECRET` | ✅ | JWT 签名密钥（至少32字符） |
| `PORT` | ❌ | 服务器端口（默认3001） |
| `NODE_ENV` | ❌ | 环境模式（development/production） |
| `SMTP_*` | ❌ | 邮件服务配置 |
| `OPENAI_API_KEY` | ❌ | OpenAI API 密钥 |
| `AI_AGENT_*` | ❌ | AI 代理配置 |

## 🚀 本地开发部署

### 1. 克隆项目

```bash
git clone <your-repository-url>
cd geo-intelligent-platform
```

### 2. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm
pnpm install
```

### 3. 配置环境变量

复制并配置环境变量：

```bash
cp .env.example .env
# 编辑 .env 文件，填入正确的配置
```

### 4. 初始化数据库

```bash
# 初始化数据库结构和数据
node scripts/init-database.js

# 或者分步执行
node scripts/init-database.js --schema-only
node scripts/init-database.js --data-only
```

### 5. 启动开发服务器

```bash
# 启动前端开发服务器
npm run dev

# 在新终端启动后端服务器
npm run server:dev
```

### 6. 访问应用

- 前端: http://localhost:5173
- 后端 API: http://localhost:3001
- 健康检查: http://localhost:3001/api/health

### 7. 测试账户

使用以下测试账户登录：

- **管理员**: admin@geo-platform.com / admin123
- **分析师**: analyst@geo-platform.com / admin123  
- **业务用户**: business@geo-platform.com / admin123

## 🌐 Vercel 生产环境部署

### 方法一：自动化部署脚本

```bash
# 运行自动化部署脚本
node scripts/deploy.js

# 仅构建不部署
node scripts/deploy.js --build-only

# 跳过测试
node scripts/deploy.js --skip-tests
```

### 方法二：手动部署

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 配置项目

```bash
# 在项目根目录运行
vercel

# 按提示配置：
# - Set up and deploy? Yes
# - Which scope? 选择你的账户
# - Link to existing project? No
# - Project name? geo-intelligent-platform
# - Directory? ./
```

#### 4. 配置环境变量

在 Vercel Dashboard 中：

1. 进入项目设置
2. 点击 **Environment Variables**
3. 添加所有必需的环境变量：

```
DATABASE_URL=postgresql://postgres:...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
JWT_SECRET=your-super-secret-jwt-key...
NODE_ENV=production
```

#### 5. 部署到生产环境

```bash
vercel --prod
```

### 方法三：GitHub 集成部署

#### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### 2. 连接 Vercel 和 GitHub

1. 在 Vercel Dashboard 点击 "New Project"
2. 选择 GitHub 仓库
3. 配置构建设置：
   - **Framework Preset**: Other
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### 3. 配置环境变量

在项目设置中添加所有环境变量。

#### 4. 部署

Vercel 会自动部署，每次推送到 main 分支都会触发重新部署。

## 🔧 部署后配置

### 1. 验证部署

访问部署的 URL 并检查：

- [ ] 页面正常加载
- [ ] 用户登录功能正常
- [ ] API 端点响应正常
- [ ] 数据库连接正常
- [ ] 健康检查端点返回正常状态

### 2. 健康检查

访问 `https://your-domain.vercel.app/api/health` 应该返回：

```json
{
  "status": "healthy",
  "timestamp": "2024-12-20T10:30:00.000Z",
  "environment": "production",
  "database": {
    "status": "connected",
    "latency": "15ms"
  }
}
```

### 3. 数据库权限配置

如果遇到权限错误，在 Supabase SQL Editor 中执行：

```sql
-- 为匿名用户授权基本读取权限
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 为认证用户授权完整权限
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;

-- 检查权限
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;
```

## 🔒 安全配置

### 1. 生产环境安全检查

- [ ] 更改所有默认密码
- [ ] 使用强 JWT 密钥
- [ ] 启用 HTTPS（Vercel 自动提供）
- [ ] 配置 CORS 策略
- [ ] 启用 RLS（行级安全）
- [ ] 定期更新依赖

### 2. Supabase 安全配置

1. **启用 RLS**：确保所有表都启用了行级安全
2. **配置策略**：为不同用户角色设置适当的访问策略
3. **API 密钥管理**：定期轮换 API 密钥
4. **数据库备份**：启用自动备份

### 3. 环境变量安全

- 不要在代码中硬编码敏感信息
- 使用 Vercel 环境变量管理
- 为不同环境使用不同的密钥
- 定期轮换密钥

## 📊 监控和维护

### 1. 应用监控

- **Vercel Analytics**: 自动启用，监控性能和使用情况
- **Supabase Monitoring**: 监控数据库性能和连接
- **错误追踪**: 检查 Vercel 函数日志

### 2. 数据库维护

```sql
-- 检查数据库大小
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 检查连接数
SELECT count(*) FROM pg_stat_activity;

-- 检查慢查询
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### 3. 性能优化

- 定期分析慢查询
- 优化数据库索引
- 监控 API 响应时间
- 使用 CDN 加速静态资源

## 🚨 故障排除

### 常见问题

#### 1. 数据库连接失败

**错误**: `connection to server failed`

**解决方案**:
- 检查 `DATABASE_URL` 格式是否正确
- 确认 Supabase 项目状态正常
- 检查网络连接
- 验证数据库密码

#### 2. 权限被拒绝

**错误**: `permission denied for table`

**解决方案**:
```sql
-- 授权给匿名用户
GRANT SELECT ON table_name TO anon;

-- 授权给认证用户
GRANT ALL PRIVILEGES ON table_name TO authenticated;
```

#### 3. JWT 验证失败

**错误**: `invalid token`

**解决方案**:
- 检查 `JWT_SECRET` 配置
- 确认前后端使用相同的密钥
- 检查 token 过期时间

#### 4. API 路由 404

**错误**: `404 Not Found`

**解决方案**:
- 检查 `vercel.json` 配置
- 确认 API 路由映射正确
- 检查函数部署状态

#### 5. 构建失败

**错误**: `Build failed`

**解决方案**:
- 检查 TypeScript 类型错误
- 确认所有依赖已安装
- 检查环境变量配置
- 查看构建日志详情

### 调试工具

#### 1. 本地调试

```bash
# 启用调试模式
DEBUG=* npm run server:dev

# 检查数据库连接
node -e "require('./api/config/database.js').checkDatabaseHealth().then(console.log)"

# 测试 API 端点
curl http://localhost:3001/api/health
```

#### 2. 生产环境调试

- 查看 Vercel 函数日志
- 使用 Supabase 日志查看器
- 检查浏览器开发者工具
- 使用 Postman 测试 API

## 📚 相关资源

### 官方文档

- [Vercel 文档](https://vercel.com/docs)
- [Supabase 文档](https://supabase.com/docs)
- [React 文档](https://react.dev/)
- [Express.js 文档](https://expressjs.com/)

### 项目文件

- `vercel.json` - Vercel 部署配置
- `package.json` - 项目依赖和脚本
- `.env.example` - 环境变量模板
- `supabase/migrations/` - 数据库迁移文件
- `scripts/` - 部署和初始化脚本

### 支持

如果遇到问题，请：

1. 查看本文档的故障排除部分
2. 检查项目 Issues
3. 查看相关服务的状态页面
4. 联系技术支持团队

---

**最后更新**: 2024-12-20  
**版本**: 1.0.0