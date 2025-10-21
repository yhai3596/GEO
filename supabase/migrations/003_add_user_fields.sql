-- 添加用户表缺失的字段
-- 创建时间: 2024-12-20

-- 添加 status 字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));

-- 添加 last_login_at 字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- 为 status 字段创建索引
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 更新现有用户的状态为 active
UPDATE users SET status = 'active' WHERE status IS NULL;