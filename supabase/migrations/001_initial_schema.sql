-- 自动化GEO智能评估平台 - Supabase初始化脚本
-- 创建时间: 2024-12-20

-- 启用必要的扩展
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

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为用户表添加更新时间触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全策略 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_mentions ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 用户表策略：用户只能访问自己的数据，管理员可以访问所有数据
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text OR 
                     EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text OR 
                     EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- 关键词表策略：用户只能访问自己创建的关键词
CREATE POLICY "Users can manage own keywords" ON keywords
    FOR ALL USING (auth.uid()::text = user_id::text OR 
                   EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- GEO结果表策略：用户只能访问自己关键词的结果
CREATE POLICY "Users can view own geo results" ON geo_results
    FOR SELECT USING (EXISTS (SELECT 1 FROM keywords WHERE id = keyword_id AND 
                             (user_id::text = auth.uid()::text OR 
                              EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'))));

-- 其他表的类似策略
CREATE POLICY "Users can manage own citations" ON citations
    FOR ALL USING (EXISTS (SELECT 1 FROM geo_results gr JOIN keywords k ON gr.keyword_id = k.id 
                          WHERE gr.id = geo_result_id AND 
                          (k.user_id::text = auth.uid()::text OR 
                           EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'))));

CREATE POLICY "Users can manage own alert rules" ON alert_rules
    FOR ALL USING (auth.uid()::text = user_id::text OR 
                   EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Users can view own alert logs" ON alert_logs
    FOR SELECT USING (EXISTS (SELECT 1 FROM alert_rules WHERE id = alert_rule_id AND 
                             (user_id::text = auth.uid()::text OR 
                              EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'))));

-- 竞争对手表：所有认证用户可以查看，管理员可以管理
CREATE POLICY "Authenticated users can view competitors" ON competitors
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage competitors" ON competitors
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Users can view competitor mentions" ON competitor_mentions
    FOR SELECT USING (auth.role() = 'authenticated');

-- 添加表注释
COMMENT ON TABLE users IS '用户表，存储系统用户信息';
COMMENT ON TABLE keywords IS '关键词表，存储监测的关键词';
COMMENT ON TABLE geo_results IS 'GEO结果表，存储AI搜索结果数据';
COMMENT ON TABLE citations IS '引用表，存储AI回答中的引用信息';
COMMENT ON TABLE alert_rules IS '告警规则表，存储用户配置的告警规则';
COMMENT ON TABLE alert_logs IS '告警日志表，存储触发的告警记录';
COMMENT ON TABLE competitors IS '竞争对手表，存储竞争对手信息';
COMMENT ON TABLE competitor_mentions IS '竞争对手提及表，存储竞争对手在AI回答中的提及情况';