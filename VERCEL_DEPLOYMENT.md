# 🚀 GEO智能评估平台 - Vercel部署指南

## 📋 部署前准备清单

### ✅ 必需条件
- [x] GitHub账号 (yhai3596@outlook.com)
- [x] Vercel账号 (可以用GitHub账号登录)
- [x] Supabase项目已创建并配置
- [x] 项目代码已推送到GitHub仓库

## 🎯 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/GEO&env=DATABASE_URL,SUPABASE_URL,SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,JWT_SECRET&envDescription=需要配置Supabase数据库和JWT密钥&envLink=https://github.com/YOUR_USERNAME/GEO/blob/main/VERCEL_DEPLOYMENT.md)

## 📝 详细部署步骤

### 第一步：准备GitHub仓库

1. **登录GitHub**
   - 访问 https://github.com
   - 使用您的账号登录：yhai3596@outlook.com

2. **创建新仓库**
   ```bash
   # 在项目根目录执行
   git init
   git add .
   git commit -m "Initial commit: GEO智能评估平台"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/GEO.git
   git push -u origin main
   ```

### 第二步：登录Vercel

1. **访问Vercel**
   - 打开 https://vercel.com
   - 点击 "Login" 按钮
   - 选择 "Continue with GitHub"
   - 使用您的GitHub账号授权登录

2. **连接GitHub仓库**
   - 在Vercel仪表盘点击 "New Project"
   - 选择您刚创建的GEO仓库
   - 点击 "Import"

### 第三步：配置环境变量

在Vercel项目设置中添加以下环境变量：

#### 🔑 必需的环境变量

| 变量名 | 描述 | 示例值 |
|--------|------|--------|
| `DATABASE_URL` | Supabase数据库连接URL | `postgresql://postgres:[password]@[host]:5432/postgres` |
| `SUPABASE_URL` | Supabase项目URL | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase匿名密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase服务角色密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `JWT_SECRET` | JWT签名密钥 | `your-super-secret-jwt-key-change-this-in-production` |
| `NODE_ENV` | 环境模式 | `production` |

#### 🔧 可选的环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `PORT` | 服务器端口 | `3001` |
| `SMTP_HOST` | 邮件服务器地址 | `smtp.gmail.com` |
| `SMTP_PORT` | 邮件服务器端口 | `587` |
| `SMTP_USER` | 邮件账号 | - |
| `SMTP_PASS` | 邮件密码 | - |

### 第四步：获取Supabase配置

1. **登录Supabase**
   - 访问 https://supabase.com
   - 登录您的账号

2. **获取项目配置**
   - 进入您的项目仪表盘
   - 点击左侧 "Settings" → "API"
   - 复制以下信息：
     - Project URL (SUPABASE_URL)
     - anon public key (SUPABASE_ANON_KEY)
     - service_role secret key (SUPABASE_SERVICE_ROLE_KEY)

3. **获取数据库URL**
   - 在Supabase项目中，点击 "Settings" → "Database"
   - 复制 "Connection string" → "URI"
   - 将 `[YOUR-PASSWORD]` 替换为您的数据库密码

### 第五步：配置Vercel环境变量

1. **在Vercel项目设置中**
   - 点击项目名称进入项目详情
   - 点击 "Settings" 标签
   - 点击左侧 "Environment Variables"

2. **添加环境变量**
   - 逐一添加上述必需的环境变量
   - 确保每个变量的值都正确填写
   - 点击 "Save" 保存

### 第六步：部署项目

1. **触发部署**
   - 在Vercel项目页面点击 "Deploy"
   - 或者推送代码到GitHub仓库自动触发部署

2. **监控部署过程**
   - 在Vercel仪表盘查看部署日志
   - 确保构建过程没有错误

## 🔍 部署后验证

### 检查清单

- [ ] **前端访问正常**：访问Vercel提供的域名，确保页面加载正常
- [ ] **API接口工作**：访问 `https://your-app.vercel.app/api/health` 检查API状态
- [ ] **数据库连接**：尝试登录功能，确保数据库连接正常
- [ ] **用户认证**：测试注册和登录功能
- [ ] **核心功能**：测试关键词管理、数据分析等核心功能

### 测试账号

使用以下测试账号验证部署：
- 邮箱：admin@geo-platform.com
- 密码：admin123

## 🛠️ 常见问题解决

### 问题1：构建失败
**解决方案：**
```bash
# 本地测试构建
npm run build

# 检查TypeScript错误
npm run check
```

### 问题2：数据库连接失败
**解决方案：**
- 检查DATABASE_URL格式是否正确
- 确认Supabase项目状态正常
- 验证数据库密码是否正确

### 问题3：API路由404错误
**解决方案：**
- 检查vercel.json配置
- 确认api/index.ts文件存在
- 查看Vercel部署日志

### 问题4：环境变量未生效
**解决方案：**
- 重新部署项目
- 检查变量名拼写
- 确认变量值没有多余空格

## 📞 技术支持

如果遇到部署问题，可以：

1. **查看部署日志**：在Vercel项目页面查看详细的构建和运行日志
2. **检查API状态**：访问 `/api/health` 端点检查服务状态
3. **验证环境变量**：确保所有必需的环境变量都已正确配置

## 🎉 部署成功

部署成功后，您将获得：
- **生产环境URL**：https://your-app.vercel.app
- **自动HTTPS**：Vercel自动提供SSL证书
- **全球CDN**：快速的内容分发网络
- **自动部署**：每次推送代码自动重新部署

---

**🚀 恭喜！您的GEO智能评估平台已成功部署到Vercel！**