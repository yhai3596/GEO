# 🌍 GEO智能评估平台

一个基于AI的地理信息智能评估和监控平台，提供实时数据分析、智能告警和可视化展示功能。

## 🚀 快速部署

### 一键部署到Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/GEO&env=DATABASE_URL,SUPABASE_URL,SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,JWT_SECRET&envDescription=需要配置Supabase数据库和JWT密钥&envLink=https://github.com/YOUR_USERNAME/GEO/blob/main/VERCEL_DEPLOYMENT.md)

### 手动部署步骤

1. **Fork此仓库**到您的GitHub账号
2. **登录Vercel**并连接您的GitHub仓库
3. **配置环境变量**（详见[部署指南](./VERCEL_DEPLOYMENT.md)）
4. **点击部署**，等待构建完成

## 📋 功能特性

### 🎯 核心功能
- **智能监控**：实时监控关键指标和数据变化
- **数据分析**：多维度数据分析和趋势预测
- **可视化展示**：丰富的图表和仪表盘
- **智能告警**：自定义告警规则和通知
- **用户管理**：完整的用户认证和权限控制

### 🛠️ 技术特性
- **响应式设计**：支持桌面端和移动端
- **实时更新**：WebSocket实时数据推送
- **高性能**：优化的前端构建和API响应
- **安全可靠**：JWT认证和数据加密
- **易于扩展**：模块化架构设计

## 🏗️ 技术架构

### 前端技术栈
- **React 18** - 现代化UI框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速的构建工具
- **Tailwind CSS** - 实用优先的CSS框架
- **Zustand** - 轻量级状态管理
- **React Router** - 客户端路由
- **Recharts** - 数据可视化图表
- **Lucide React** - 现代化图标库

### 后端技术栈
- **Express.js** - Node.js Web框架
- **TypeScript** - 类型安全的服务端开发
- **PostgreSQL** - 关系型数据库
- **Supabase** - 后端即服务平台
- **JWT** - 用户认证和授权
- **Socket.io** - 实时通信
- **Winston** - 日志管理

### 部署和运维
- **Vercel** - 前端和API部署
- **Supabase** - 数据库和后端服务
- **GitHub Actions** - CI/CD自动化
- **环境变量管理** - 安全的配置管理

## 📦 项目结构

```
GEO/
├── src/                    # 前端源码
│   ├── components/         # React组件
│   ├── pages/             # 页面组件
│   ├── hooks/             # 自定义Hooks
│   ├── utils/             # 工具函数
│   └── types/             # TypeScript类型定义
├── api/                   # 后端API
│   ├── routes/            # API路由
│   ├── services/          # 业务逻辑
│   ├── middleware/        # 中间件
│   ├── config/            # 配置文件
│   └── utils/             # 工具函数
├── public/                # 静态资源
├── dist/                  # 构建输出
├── supabase/              # Supabase配置
│   └── migrations/        # 数据库迁移
├── docs/                  # 项目文档
├── vercel.json            # Vercel部署配置
├── package.json           # 项目依赖
└── README.md              # 项目说明
```

## 🚀 本地开发

### 环境要求
- Node.js 18+ 
- npm 或 pnpm
- PostgreSQL 数据库（推荐使用Supabase）

### 安装依赖
```bash
# 使用npm
npm install

# 或使用pnpm
pnpm install
```

### 环境配置
1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 配置必需的环境变量：
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/geo_platform
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
```

### 启动开发服务器
```bash
# 同时启动前端和后端
npm run dev

# 或分别启动
npm run client:dev  # 前端开发服务器 (http://localhost:5173)
npm run server:dev  # 后端API服务器 (http://localhost:3001)
```

### 构建项目
```bash
# 构建前端
npm run build

# 构建后端
npm run server:build

# TypeScript类型检查
npm run check
```

## 📚 部署指南

### 详细部署文档
- [📖 Vercel部署指南](./VERCEL_DEPLOYMENT.md) - 完整的Vercel部署步骤
- [✅ 部署检查清单](./DEPLOYMENT_CHECKLIST.md) - 部署前后的检查项目
- [🔧 环境变量配置](/.env.example) - 所有环境变量说明

### 快速部署检查
- [ ] GitHub仓库已创建并推送代码
- [ ] Supabase项目已创建并配置
- [ ] 环境变量已正确设置
- [ ] 数据库表结构已创建
- [ ] 本地构建测试通过

## 🧪 测试

### 测试账号
- **管理员账号**：admin@geo-platform.com / admin123
- **普通用户**：user@geo-platform.com / user123

### API测试
```bash
# 健康检查
curl https://your-app.vercel.app/api/health

# 用户登录
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@geo-platform.com","password":"admin123"}'
```

## 📊 功能模块

### 1. 仪表盘 (Dashboard)
- 实时数据概览
- 关键指标展示
- 趋势分析图表
- 快速操作入口

### 2. 关键词管理 (Keywords)
- 关键词添加和编辑
- 监控状态管理
- 批量操作功能
- 搜索和筛选

### 3. 数据分析 (Analytics)
- 多维度数据分析
- 自定义时间范围
- 数据导出功能
- 可视化图表

### 4. 系统配置 (Settings)
- 告警规则配置
- 系统参数设置
- 通知配置
- 用户偏好设置

### 5. 用户管理 (Users)
- 用户账号管理
- 权限分配
- 操作日志
- 安全设置

## 🔧 API接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/profile` - 获取用户信息

### 业务接口
- `GET /api/dashboard/stats` - 仪表盘统计
- `GET /api/keywords` - 关键词列表
- `POST /api/keywords` - 添加关键词
- `GET /api/monitoring/data` - 监控数据
- `GET /api/alerts` - 告警列表

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持与反馈

- **问题反馈**：[GitHub Issues](https://github.com/YOUR_USERNAME/GEO/issues)
- **功能建议**：[GitHub Discussions](https://github.com/YOUR_USERNAME/GEO/discussions)
- **技术文档**：[项目Wiki](https://github.com/YOUR_USERNAME/GEO/wiki)

## 🎉 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**🌟 如果这个项目对您有帮助，请给我们一个Star！**