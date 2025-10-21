# ✅ GEO智能评估平台 - 部署检查清单

## 🚀 部署前检查

### 📋 代码准备
- [ ] 所有代码已提交到Git仓库
- [ ] 代码已推送到GitHub远程仓库
- [ ] 没有未解决的TypeScript错误
- [ ] 所有依赖包已正确安装
- [ ] 构建脚本测试通过

### 🔧 环境配置
- [ ] `.env.example` 文件已创建
- [ ] 所有必需的环境变量已识别
- [ ] Supabase项目已创建并配置
- [ ] 数据库表结构已创建
- [ ] RLS (行级安全) 策略已配置

### 🗄️ 数据库检查
- [ ] Supabase项目状态正常
- [ ] 数据库连接测试成功
- [ ] 所有必需的表已创建：
  - [ ] users (用户表)
  - [ ] keywords (关键词表)
  - [ ] monitoring_data (监控数据表)
  - [ ] alerts (告警表)
  - [ ] system_configs (系统配置表)
- [ ] 初始数据已插入
- [ ] 权限配置正确 (anon/authenticated角色)

## 🌐 Vercel部署检查

### 📝 账号准备
- [ ] GitHub账号可正常访问
- [ ] Vercel账号已创建 (可用GitHub登录)
- [ ] GitHub仓库权限已授权给Vercel

### ⚙️ 项目配置
- [ ] `vercel.json` 配置文件正确
- [ ] `package.json` 构建脚本配置正确
- [ ] API路由配置正确
- [ ] 静态文件构建配置正确

### 🔑 环境变量配置
在Vercel项目设置中配置以下变量：

#### 必需变量
- [ ] `DATABASE_URL` - Supabase数据库连接URL
- [ ] `SUPABASE_URL` - Supabase项目URL
- [ ] `SUPABASE_ANON_KEY` - Supabase匿名密钥
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase服务角色密钥
- [ ] `JWT_SECRET` - JWT签名密钥
- [ ] `NODE_ENV` - 设置为 `production`

#### 可选变量
- [ ] `SMTP_HOST` - 邮件服务器 (如需邮件功能)
- [ ] `SMTP_PORT` - 邮件端口
- [ ] `SMTP_USER` - 邮件账号
- [ ] `SMTP_PASS` - 邮件密码

## 🧪 部署后验证

### 🌐 网站访问
- [ ] 前端页面正常加载
- [ ] 所有静态资源加载正常
- [ ] 响应式设计在不同设备上正常显示
- [ ] 页面路由正常工作

### 🔌 API接口测试
- [ ] `/api/health` - 健康检查接口
- [ ] `/api/auth/login` - 用户登录接口
- [ ] `/api/auth/register` - 用户注册接口
- [ ] `/api/keywords` - 关键词管理接口
- [ ] `/api/monitoring` - 监控数据接口
- [ ] `/api/alerts` - 告警接口

### 🔐 用户认证测试
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] JWT令牌生成和验证正常
- [ ] 受保护路由访问控制正常

### 📊 核心功能测试
- [ ] 仪表盘数据显示正常
- [ ] 关键词管理功能正常
- [ ] 数据分析图表显示正常
- [ ] 系统配置功能正常
- [ ] 用户管理功能正常

### 🗄️ 数据库连接测试
- [ ] 数据库连接正常
- [ ] 数据读取正常
- [ ] 数据写入正常
- [ ] 数据更新正常
- [ ] 数据删除正常

## 🚨 常见问题排查

### 构建失败
```bash
# 本地测试构建
npm run build

# 检查TypeScript错误
npm run check

# 检查依赖问题
npm install
```

### API接口404
- [ ] 检查 `vercel.json` 路由配置
- [ ] 确认 `api/index.ts` 文件存在
- [ ] 查看Vercel部署日志

### 数据库连接失败
- [ ] 检查 `DATABASE_URL` 格式
- [ ] 确认Supabase项目状态
- [ ] 验证数据库密码
- [ ] 检查网络连接

### 环境变量问题
- [ ] 确认所有必需变量已配置
- [ ] 检查变量名拼写
- [ ] 确认变量值格式正确
- [ ] 重新部署项目

## 📞 技术支持

### 日志查看
- **Vercel部署日志**：在Vercel项目页面查看
- **运行时日志**：在Vercel Functions页面查看
- **数据库日志**：在Supabase项目日志页面查看

### 监控工具
- **Vercel Analytics**：网站访问统计
- **Supabase Dashboard**：数据库监控
- **API健康检查**：`/api/health` 端点

### 联系方式
如遇到技术问题，可以：
1. 查看项目文档和部署指南
2. 检查Vercel和Supabase的状态页面
3. 查看相关的错误日志和监控数据

---

## ✅ 部署完成确认

当所有检查项都完成后，您的GEO智能评估平台就成功部署了！

**🎉 部署成功标志：**
- ✅ 网站可以正常访问
- ✅ 用户可以正常登录
- ✅ 所有核心功能正常工作
- ✅ 数据库连接稳定
- ✅ API接口响应正常

**📱 测试账号：**
- 邮箱：admin@geo-platform.com
- 密码：admin123

**🌐 访问地址：**
- 生产环境：https://your-app.vercel.app
- API接口：https://your-app.vercel.app/api