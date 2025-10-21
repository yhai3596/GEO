-- 自动化GEO智能评估平台 - 初始数据脚本
-- 创建时间: 2024-12-20

-- 插入管理员用户（密码: admin123）
INSERT INTO users (id, email, password_hash, name, role) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'admin@geo-platform.com', '$2a$12$ugFAIElMSDJgolqb7T6JmO1duxLu5Bu5W7ZP.z/3isHh3A3ysgLaS', '系统管理员', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 插入示例用户
INSERT INTO users (id, email, password_hash, name, role) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'analyst@geo-platform.com', '$2a$12$ugFAIElMSDJgolqb7T6JmO1duxLu5Bu5W7ZP.z/3isHh3A3ysgLaS', 'GEO分析师', 'geo_analyst'),
('550e8400-e29b-41d4-a716-446655440002', 'business@geo-platform.com', '$2a$12$ugFAIElMSDJgolqb7T6JmO1duxLu5Bu5W7ZP.z/3isHh3A3ysgLaS', '业务用户', 'business_user')
ON CONFLICT (email) DO NOTHING;

-- 插入示例关键词
INSERT INTO keywords (id, user_id, keyword, category, is_active) VALUES 
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '最佳CRM软件推荐', '软件推荐', true),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '企业级项目管理工具', '工具比较', true),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '数字营销策略指南', '营销策略', true),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '电商平台选择建议', '电商', true)
ON CONFLICT (id) DO NOTHING;

-- 插入示例竞争对手
INSERT INTO competitors (id, company_name, domain, brand_keywords, is_active) VALUES 
('770e8400-e29b-41d4-a716-446655440000', 'Salesforce', 'salesforce.com', ARRAY['Salesforce', 'Sales Cloud', 'Service Cloud'], true),
('770e8400-e29b-41d4-a716-446655440001', 'HubSpot', 'hubspot.com', ARRAY['HubSpot', 'HubSpot CRM', 'Marketing Hub'], true),
('770e8400-e29b-41d4-a716-446655440002', 'Microsoft', 'microsoft.com', ARRAY['Microsoft', 'Dynamics 365', 'Office 365'], true),
('770e8400-e29b-41d4-a716-446655440003', 'Asana', 'asana.com', ARRAY['Asana', 'Asana项目管理'], true),
('770e8400-e29b-41d4-a716-446655440004', 'Trello', 'trello.com', ARRAY['Trello', 'Trello看板'], true)
ON CONFLICT (id) DO NOTHING;

-- 插入示例告警规则
INSERT INTO alert_rules (id, user_id, rule_name, conditions, notification_config, is_active) VALUES 
('880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '引用率下降告警', 
 '{"citation_rate_threshold": 0.3, "time_period": "7d"}', 
 '{"email": true, "webhook": false}', true),
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '竞争对手提及增加', 
 '{"competitor_mention_increase": 50, "time_period": "24h"}', 
 '{"email": true, "webhook": true}', true),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '关键词排名变化', 
 '{"ranking_change_threshold": 3, "keywords": ["数字营销策略指南"]}', 
 '{"email": true, "webhook": false}', true)
ON CONFLICT (id) DO NOTHING;

-- 插入示例GEO结果数据
INSERT INTO geo_results (id, keyword_id, search_engine, ai_answer_text, citations_json, is_cited, citation_type, brand_mentions, query_timestamp) VALUES 
('990e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'google', 
 '选择CRM软件时，需要考虑功能完整性、易用性和价格。Salesforce是市场领导者，提供全面的销售和客户服务功能。HubSpot适合中小企业，提供免费版本。Pipedrive专注于销售流程管理，界面简洁易用。', 
 '[{"url": "https://example.com/crm-guide", "title": "CRM软件选择指南", "position": 1}, {"url": "https://salesforce.com", "title": "Salesforce官网", "position": 2}]', 
 true, 'direct', ARRAY['Salesforce', 'HubSpot', 'Pipedrive'], NOW() - INTERVAL '2 hours'),
('990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'google', 
 '企业级项目管理工具推荐包括Asana、Monday.com和Microsoft Project。Asana适合团队协作，Monday.com提供可视化看板，Microsoft Project适合复杂项目规划。选择时需考虑团队规模、项目复杂度和预算。', 
 '[{"url": "https://asana.com", "title": "Asana官网", "position": 1}, {"url": "https://monday.com", "title": "Monday.com", "position": 2}]', 
 true, 'indirect', ARRAY['Asana', 'Monday.com', 'Microsoft Project'], NOW() - INTERVAL '1 hour'),
('990e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'google', 
 '数字营销策略应包含内容营销、社交媒体营销、搜索引擎优化和付费广告。首先明确目标受众，然后选择合适的渠道。内容营销是基础，需要持续产出有价值的内容。社交媒体营销要注重互动和社区建设。', 
 '[{"url": "https://example.com/digital-marketing", "title": "数字营销完整指南", "position": 1}]', 
 false, null, ARRAY[]::text[], NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- 插入对应的引用数据
INSERT INTO citations (id, geo_result_id, url, title, snippet, position, citation_type) VALUES 
('aa0e8400-e29b-41d4-a716-446655440000', '990e8400-e29b-41d4-a716-446655440000', 'https://example.com/crm-guide', 'CRM软件选择指南', 'CRM软件选择的关键因素包括功能、价格和易用性...', 1, 'reference'),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440000', 'https://salesforce.com', 'Salesforce官网', 'Salesforce是全球领先的CRM平台...', 2, 'official'),
('aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440001', 'https://asana.com', 'Asana官网', 'Asana帮助团队组织、跟踪和管理工作...', 1, 'official'),
('aa0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440001', 'https://monday.com', 'Monday.com', 'Monday.com是一个工作操作系统...', 2, 'official')
ON CONFLICT (id) DO NOTHING;

-- 插入竞争对手提及数据
INSERT INTO competitor_mentions (id, competitor_id, geo_result_id, mention_type, mention_count) VALUES 
('bb0e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', '990e8400-e29b-41d4-a716-446655440000', 'positive', 1),
('bb0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440000', 'positive', 1),
('bb0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440001', 'positive', 1)
ON CONFLICT (id) DO NOTHING;

-- 插入示例告警日志
INSERT INTO alert_logs (id, alert_rule_id, alert_type, alert_data, status, triggered_at) VALUES 
('cc0e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440000', 'citation_rate_drop', 
 '{"keyword": "最佳CRM软件推荐", "old_rate": 0.8, "new_rate": 0.2, "threshold": 0.3}', 'sent', NOW() - INTERVAL '1 day'),
('cc0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'competitor_mention_increase', 
 '{"competitor": "Salesforce", "mention_increase": 75, "threshold": 50}', 'sent', NOW() - INTERVAL '6 hours')
ON CONFLICT (id) DO NOTHING;

-- 创建视图：用户关键词统计
CREATE OR REPLACE VIEW user_keyword_stats AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    COUNT(k.id) as total_keywords,
    COUNT(CASE WHEN k.is_active THEN 1 END) as active_keywords,
    COUNT(gr.id) as total_results,
    COUNT(CASE WHEN gr.is_cited THEN 1 END) as cited_results,
    ROUND(
        CASE 
            WHEN COUNT(gr.id) > 0 THEN 
                COUNT(CASE WHEN gr.is_cited THEN 1 END)::numeric / COUNT(gr.id) * 100 
            ELSE 0 
        END, 2
    ) as citation_rate
FROM users u
LEFT JOIN keywords k ON u.id = k.user_id
LEFT JOIN geo_results gr ON k.id = gr.keyword_id
GROUP BY u.id, u.name;

-- 创建视图：竞争对手提及统计
CREATE OR REPLACE VIEW competitor_mention_stats AS
SELECT 
    c.id as competitor_id,
    c.company_name,
    COUNT(cm.id) as total_mentions,
    COUNT(CASE WHEN cm.mention_type = 'positive' THEN 1 END) as positive_mentions,
    COUNT(CASE WHEN cm.mention_type = 'negative' THEN 1 END) as negative_mentions,
    COUNT(CASE WHEN cm.mention_type = 'neutral' THEN 1 END) as neutral_mentions,
    MAX(cm.detected_at) as last_mention_date
FROM competitors c
LEFT JOIN competitor_mentions cm ON c.id = cm.competitor_id
WHERE c.is_active = true
GROUP BY c.id, c.company_name
ORDER BY total_mentions DESC;

-- 创建视图：每日GEO结果统计
CREATE OR REPLACE VIEW daily_geo_stats AS
SELECT 
    DATE(query_timestamp) as query_date,
    COUNT(*) as total_queries,
    COUNT(CASE WHEN is_cited THEN 1 END) as cited_queries,
    ROUND(
        CASE 
            WHEN COUNT(*) > 0 THEN 
                COUNT(CASE WHEN is_cited THEN 1 END)::numeric / COUNT(*) * 100 
            ELSE 0 
        END, 2
    ) as citation_rate,
    COUNT(DISTINCT keyword_id) as unique_keywords
FROM geo_results
WHERE query_timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(query_timestamp)
ORDER BY query_date DESC;

-- 添加视图注释
COMMENT ON VIEW user_keyword_stats IS '用户关键词统计视图，显示每个用户的关键词和引用统计';
COMMENT ON VIEW competitor_mention_stats IS '竞争对手提及统计视图，显示竞争对手在AI回答中的提及情况';
COMMENT ON VIEW daily_geo_stats IS '每日GEO结果统计视图，显示过去30天的查询和引用趋势';