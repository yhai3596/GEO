import pool from '../config/database.js';
import { 
  User, 
  Keyword, 
  GeoResult, 
  AlertRule, 
  Competitor,
  SovAnalytics,
  CompetitorAnalytics,
  KeywordPerformance 
} from '../../shared/types/database.js';

export class DatabaseService {
  public pool = pool;
  
  // 用户相关操作
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'last_login_at'>): Promise<User> {
    const query = `
      INSERT INTO users (username, email, password, role, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [userData.username, userData.email, userData.password, userData.role, userData.status];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getAllUsers(): Promise<User[]> {
    const query = 'SELECT * FROM users ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    const query = 'UPDATE users SET last_login_at = NOW() WHERE id = $1';
    await pool.query(query, [userId]);
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    const query = 'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2';
    await pool.query(query, [hashedPassword, userId]);
  }

  async updateUserStatus(userId: string, status: string): Promise<User | null> {
    const query = `
      UPDATE users 
      SET status = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await pool.query(query, [status, userId]);
    return result.rows[0] || null;
  }

  // 关键词相关操作
  async createKeyword(keywordData: Omit<Keyword, 'id' | 'created_at'>): Promise<Keyword> {
    const query = `
      INSERT INTO keywords (user_id, keyword, category, is_active, search_config)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      keywordData.user_id,
      keywordData.keyword,
      keywordData.category,
      keywordData.is_active,
      JSON.stringify(keywordData.search_config)
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getKeywordsByUserId(userId: string): Promise<Keyword[]> {
    const query = 'SELECT * FROM keywords WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async getKeywordById(id: string): Promise<Keyword | null> {
    const query = 'SELECT * FROM keywords WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async updateKeyword(id: string, updates: Partial<Keyword>): Promise<Keyword | null> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(key === 'search_config' ? JSON.stringify(value) : value);
        paramCount++;
      }
    });

    if (setClause.length === 0) return null;

    const query = `
      UPDATE keywords 
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteKeyword(id: string): Promise<boolean> {
    const query = 'DELETE FROM keywords WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  // GEO结果相关操作
  async createGeoResult(resultData: Omit<GeoResult, 'id' | 'query_timestamp'>): Promise<GeoResult> {
    const query = `
      INSERT INTO geo_results (keyword_id, search_engine, ai_answer_text, citations_json, is_cited, citation_type, brand_mentions, screenshot_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      resultData.keyword_id,
      resultData.search_engine,
      resultData.ai_answer_text,
      JSON.stringify(resultData.citations_json),
      resultData.is_cited,
      resultData.citation_type,
      resultData.brand_mentions,
      resultData.screenshot_url
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getGeoResultsByKeywordId(keywordId: string, limit: number = 50): Promise<GeoResult[]> {
    const query = `
      SELECT * FROM geo_results 
      WHERE keyword_id = $1 
      ORDER BY query_timestamp DESC 
      LIMIT $2
    `;
    const result = await pool.query(query, [keywordId, limit]);
    return result.rows;
  }

  async getRecentGeoResults(days: number = 7, limit: number = 100): Promise<GeoResult[]> {
    const query = `
      SELECT * FROM geo_results 
      WHERE query_timestamp >= NOW() - INTERVAL '${days} days'
      ORDER BY query_timestamp DESC 
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  // 分析数据相关操作
  async getSovAnalytics(userId: string, days: number = 30): Promise<SovAnalytics> {
    const query = `
      SELECT 
        COUNT(*) as total_queries,
        COUNT(CASE WHEN gr.is_cited = true THEN 1 END) as cited_queries
      FROM geo_results gr
      JOIN keywords k ON gr.keyword_id = k.id
      WHERE k.user_id = $1 
        AND gr.query_timestamp >= NOW() - INTERVAL '${days} days'
    `;
    const result = await pool.query(query, [userId]);
    const row = result.rows[0];
    
    const total = parseInt(row.total_queries);
    const cited = parseInt(row.cited_queries);
    const sovPercentage = total > 0 ? (cited / total) * 100 : 0;

    return {
      total_queries: total,
      cited_queries: cited,
      sov_percentage: sovPercentage,
      period: `${days}d`,
      trend: 'stable' // TODO: 实现趋势计算
    };
  }

  async getCompetitorAnalytics(days: number = 30): Promise<CompetitorAnalytics[]> {
    const query = `
      SELECT 
        c.id as competitor_id,
        c.company_name,
        COUNT(cm.id) as mention_count
      FROM competitors c
      LEFT JOIN competitor_mentions cm ON c.id = cm.competitor_id
      LEFT JOIN geo_results gr ON cm.geo_result_id = gr.id
      WHERE c.is_active = true 
        AND (gr.query_timestamp IS NULL OR gr.query_timestamp >= NOW() - INTERVAL '${days} days')
      GROUP BY c.id, c.company_name
      ORDER BY mention_count DESC
    `;
    const result = await pool.query(query);
    
    return result.rows.map(row => ({
      competitor_id: row.competitor_id,
      company_name: row.company_name,
      mention_count: parseInt(row.mention_count),
      sov_percentage: 0, // TODO: 计算竞争对手SoV
      trend: 'stable' as const
    }));
  }

  async getKeywordPerformance(userId: string, days: number = 30): Promise<KeywordPerformance[]> {
    const query = `
      SELECT 
        k.id as keyword_id,
        k.keyword,
        COUNT(gr.id) as total_queries,
        COUNT(CASE WHEN gr.is_cited = true THEN 1 END) as cited_count,
        AVG(CASE WHEN c.position IS NOT NULL THEN c.position END) as avg_position
      FROM keywords k
      LEFT JOIN geo_results gr ON k.id = gr.keyword_id
      LEFT JOIN citations c ON gr.id = c.geo_result_id
      WHERE k.user_id = $1 
        AND k.is_active = true
        AND (gr.query_timestamp IS NULL OR gr.query_timestamp >= NOW() - INTERVAL '${days} days')
      GROUP BY k.id, k.keyword
      ORDER BY cited_count DESC
    `;
    const result = await pool.query(query, [userId]);
    
    return result.rows.map(row => {
      const total = parseInt(row.total_queries);
      const cited = parseInt(row.cited_count);
      return {
        keyword_id: row.keyword_id,
        keyword: row.keyword,
        total_queries: total,
        cited_count: cited,
        citation_rate: total > 0 ? (cited / total) * 100 : 0,
        avg_position: parseFloat(row.avg_position) || 0,
        trend: 'stable' as const
      };
    });
  }

  // 告警规则相关操作
  async createAlertRule(ruleData: Omit<AlertRule, 'id' | 'created_at'>): Promise<AlertRule> {
    const query = `
      INSERT INTO alert_rules (user_id, rule_name, conditions, notification_config, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      ruleData.user_id,
      ruleData.rule_name,
      JSON.stringify(ruleData.conditions),
      JSON.stringify(ruleData.notification_config),
      ruleData.is_active
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getAlertRulesByUserId(userId: string): Promise<AlertRule[]> {
    const query = 'SELECT * FROM alert_rules WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async updateAlertRule(id: string, updates: Partial<AlertRule>): Promise<AlertRule | null> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(['conditions', 'notification_config'].includes(key) ? JSON.stringify(value) : value);
        paramCount++;
      }
    });

    if (setClause.length === 0) return null;

    const query = `
      UPDATE alert_rules 
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // 竞争对手相关操作
  async getAllCompetitors(): Promise<Competitor[]> {
    const query = 'SELECT * FROM competitors WHERE is_active = true ORDER BY company_name';
    const result = await pool.query(query);
    return result.rows;
  }

  async createCompetitor(competitorData: Omit<Competitor, 'id' | 'created_at'>): Promise<Competitor> {
    const query = `
      INSERT INTO competitors (company_name, domain, brand_keywords, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [
      competitorData.company_name,
      competitorData.domain,
      competitorData.brand_keywords,
      competitorData.is_active
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 数据库健康检查
  async healthCheck(): Promise<boolean> {
    try {
      const result = await pool.query('SELECT 1');
      return result.rows.length > 0;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

export const dbService = new DatabaseService();