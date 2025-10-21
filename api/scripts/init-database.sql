-- 自动化GEO智能评估平台数据库初始化脚本

-- 创建数据库（如果不存在）
-- CREATE DATABASE geo_platform;

-- 使用数据库
-- \c geo_platform;

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'business_user' CHECK (role IN ('admin', 'geo_analyst', 'business_user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户表索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 创建关键词表
CREATE TABLE IF NOT EXISTS keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    keyword VARCHAR(500) NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    search_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建关键词表索引
CREATE INDEX IF NOT EXISTS idx_keywords_user_id ON keywords(user_id);
CREATE INDEX IF NOT EXISTS idx_keywords_category ON keywords(category);
CREATE INDEX IF NOT EXISTS idx_keywords_is_active ON keywords(is_active);

-- 创建GEO结果表
CREATE TABLE IF NOT EXISTS geo_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE,
    search_engine VARCHAR(50) DEFAULT 'google',
    ai_answer_text TEXT,
    citations_json JSONB DEFAULT '[]',
    is_cited BOOLEAN DEFAULT false,
    citation_type VARCHAR(50),
    brand_mentions TEXT[],
    query_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    screenshot_url VARCHAR(500)
);

-- 创建GEO结果表索引
CREATE INDEX IF NOT EXISTS idx_geo_results_keyword_id ON geo_results(keyword_id);
CREATE INDEX IF NOT EXISTS idx_geo_results_query_timestamp ON geo_results(query_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_geo_results_is_cited ON geo_results(is_cited);
CREATE INDEX IF NOT EXISTS idx_geo_results_citation_type ON geo_results(citation_type);

-- 创建引用表
CREATE TABLE IF NOT EXISTS citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    geo_result_id UUID REFERENCES geo_results(id) ON DELETE CASCADE,
    url VARCHAR(1000),
    title VARCHAR(500),
    snippet TEXT,
    position INTEGER,
    citation_type VARCHAR(50)
);

-- 创建引用表索引
CREATE INDEX IF NOT EXISTS idx_citations_geo_result_id ON citations(geo_result_id);
CREATE INDEX IF NOT EXISTS idx_citations_position ON citations(position);

-- 创建告警规则表
CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rule_name VARCHAR(200) NOT NULL,
    conditions JSONB NOT NULL,
    notification_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建告警规则表索引
CREATE INDEX IF NOT EXISTS idx_alert_rules_user_id ON alert_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_is_active ON alert_rules(is_active);

-- 创建告警日志表
CREATE TABLE IF NOT EXISTS alert_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_rule_id UUID REFERENCES alert_rules(id) ON DELETE CASCADE,
    alert_type VARCHAR(100),
    alert_data JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending',
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建告警日志表索引
CREATE INDEX IF NOT EXISTS idx_alert_logs_alert_rule_id ON alert_logs(alert_rule_id);
CREATE INDEX IF NOT EXISTS idx_alert_logs_triggered_at ON alert_logs(triggered_at DESC);

-- 创建竞争对手表
CREATE TABLE IF NOT EXISTS competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(200) NOT NULL,
    domain VARCHAR(255),
    brand_keywords TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建竞争对手表索引
CREATE INDEX IF NOT EXISTS idx_competitors_company_name ON competitors(company_name);
CREATE INDEX IF NOT EXISTS idx_competitors_is_active ON competitors(is_active);

-- 创建竞争对手提及表
CREATE TABLE IF NOT EXISTS competitor_mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE,
    geo_result_id UUID REFERENCES geo_results(id) ON DELETE CASCADE,
    mention_type VARCHAR(50),
    mention_count INTEGER DEFAULT 1,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建竞争对手提及表索引
CREATE INDEX IF NOT EXISTS idx_competitor_mentions_competitor_id ON competitor_mentions(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_mentions_geo_result_id ON competitor_mentions(geo_result_id);
CREATE INDEX IF NOT EXISTS idx_competitor_mentions_detected_at ON competitor_mentions(detected_at DESC);

-- 插入默认管理员用户（密码：admin123，已加密）
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@geo-platform.com', '$2b$10$rOzJqQZJqQZJqQZJqQZJqOzJqQZJqQZJqQZJqQZJqQZJqQZJqQZJq', '系统管理员', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 插入示例关键词
INSERT INTO keywords (user_id, keyword, category, search_config) VALUES 
((SELECT id FROM users WHERE email = 'admin@geo-platform.com'), 'AI搜索优化', 'SEO', '{"frequency": "daily", "locations": ["CN", "US"]}'),
((SELECT id FROM users WHERE email = 'admin@geo-platform.com'), '品牌营销策略', '营销', '{"frequency": "weekly", "locations": ["CN"]}'),
((SELECT id FROM users WHERE email = 'admin@geo-platform.com'), 'GEO智能评估', '技术', '{"frequency": "daily", "locations": ["CN"]}')
ON CONFLICT DO NOTHING;

-- 插入默认告警规则
INSERT INTO alert_rules (user_id, rule_name, conditions, notification_config) VALUES 
((SELECT id FROM users WHERE email = 'admin@geo-platform.com'), 'SoV下降告警', '{"metric": "sov", "threshold": 0.1, "direction": "decrease", "period": "3d"}', '{"channels": ["email"], "recipients": ["admin@geo-platform.com"]}')
ON CONFLICT DO NOTHING;

-- 插入示例竞争对手
INSERT INTO competitors (company_name, domain, brand_keywords) VALUES 
('竞争对手A', 'competitor-a.com', ARRAY['品牌A', '产品A']),
('竞争对手B', 'competitor-b.com', ARRAY['品牌B', '产品B'])
ON CONFLICT DO NOTHING;

-- 插入一些示例GEO结果数据
INSERT INTO geo_results (keyword_id, search_engine, ai_answer_text, is_cited, citation_type, brand_mentions) VALUES 
((SELECT id FROM keywords WHERE keyword = 'AI搜索优化' LIMIT 1), 'google', 'AI搜索优化是一种新兴的数字营销策略...', true, 'direct_link', ARRAY['我们的品牌']),
((SELECT id FROM keywords WHERE keyword = '品牌营销策略' LIMIT 1), 'google', '品牌营销策略需要考虑多个维度...', false, null, ARRAY[]),
((SELECT id FROM keywords WHERE keyword = 'GEO智能评估' LIMIT 1), 'google', 'GEO智能评估平台可以帮助企业...', true, 'brand_mention', ARRAY['我们的品牌'])
ON CONFLICT DO NOTHING;

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为用户表添加更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON DATABASE geo_platform IS '自动化GEO智能评估平台数据库';
COMMENT ON TABLE users IS '用户表，存储系统用户信息';
COMMENT ON TABLE keywords IS '关键词表，存储监测的关键词';
COMMENT ON TABLE geo_results IS 'GEO结果表，存储AI搜索结果数据';
COMMENT ON TABLE citations IS '引用表，存储AI回答中的引用信息';
COMMENT ON TABLE alert_rules IS '告警规则表，存储用户配置的告警规则';
COMMENT ON TABLE alert_logs IS '告警日志表，存储触发的告警记录';
COMMENT ON TABLE competitors IS '竞争对手表，存储竞争对手信息';
COMMENT ON TABLE competitor_mentions IS '竞争对手提及表，存储竞争对手在AI回答中的提及情况';