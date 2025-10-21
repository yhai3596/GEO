// 数据库模型类型定义

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'geo_analyst' | 'business_user';
  status?: 'active' | 'inactive' | 'suspended';
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
}

export interface Keyword {
  id: string;
  user_id: string;
  keyword: string;
  category?: string;
  is_active: boolean;
  search_config: {
    frequency?: 'daily' | 'weekly' | 'monthly';
    locations?: string[];
    devices?: string[];
    search_engines?: string[];
  };
  created_at: Date;
}

export interface GeoResult {
  id: string;
  keyword_id: string;
  search_engine: string;
  ai_answer_text?: string;
  citations_json: Citation[];
  is_cited: boolean;
  citation_type?: 'direct_link' | 'brand_mention' | 'content_contribution';
  brand_mentions: string[];
  query_timestamp: Date;
  screenshot_url?: string;
}

export interface Citation {
  id: string;
  geo_result_id: string;
  url: string;
  title: string;
  snippet: string;
  position: number;
  citation_type: string;
}

export interface AlertRule {
  id: string;
  user_id: string;
  rule_name: string;
  conditions: {
    metric: string;
    threshold: number;
    direction: 'increase' | 'decrease';
    period: string;
  };
  notification_config: {
    channels: string[];
    recipients: string[];
  };
  is_active: boolean;
  created_at: Date;
}

export interface AlertLog {
  id: string;
  alert_rule_id: string;
  alert_type: string;
  alert_data: Record<string, any>;
  status: 'pending' | 'sent' | 'failed';
  triggered_at: Date;
}

export interface Competitor {
  id: string;
  company_name: string;
  domain: string;
  brand_keywords: string[];
  is_active: boolean;
  created_at: Date;
}

export interface CompetitorMention {
  id: string;
  competitor_id: string;
  geo_result_id: string;
  mention_type: string;
  mention_count: number;
  detected_at: Date;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分析数据类型
export interface SovAnalytics {
  total_queries: number;
  cited_queries: number;
  sov_percentage: number;
  period: string;
  trend: 'up' | 'down' | 'stable';
}

export interface CompetitorAnalytics {
  competitor_id: string;
  company_name: string;
  mention_count: number;
  sov_percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface KeywordPerformance {
  keyword_id: string;
  keyword: string;
  total_queries: number;
  cited_count: number;
  citation_rate: number;
  avg_position: number;
  trend: 'up' | 'down' | 'stable';
}

// 用户认证类型
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: Omit<User, 'password_hash'>;
  message?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'geo_analyst' | 'business_user';
}

// 关键词管理类型
export interface CreateKeywordRequest {
  keyword: string;
  category?: string;
  search_config?: Keyword['search_config'];
}

export interface UpdateKeywordRequest extends Partial<CreateKeywordRequest> {
  is_active?: boolean;
}

// 告警规则类型
export interface CreateAlertRuleRequest {
  rule_name: string;
  conditions: AlertRule['conditions'];
  notification_config: AlertRule['notification_config'];
}

export interface UpdateAlertRuleRequest extends Partial<CreateAlertRuleRequest> {
  is_active?: boolean;
}