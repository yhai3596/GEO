import { Router } from 'express';
import { DatabaseService } from '../services/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const dbService = new DatabaseService();

// 获取仪表盘概览数据
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // 获取关键词总数
    const keywordsResult = await dbService.pool.query(
      'SELECT COUNT(*) as total FROM keywords WHERE user_id = $1',
      [userId]
    );
    const totalKeywords = parseInt(keywordsResult.rows[0].total);

    // 获取今日GEO结果数量
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const geoResultsResult = await dbService.pool.query(
      `SELECT COUNT(*) as total FROM geo_results gr 
       JOIN keywords k ON gr.keyword_id = k.id 
       WHERE k.user_id = $1 AND gr.created_at >= $2`,
      [userId, today]
    );
    const todayGeoResults = parseInt(geoResultsResult.rows[0].total);

    // 获取活跃告警数量
    const alertsResult = await dbService.pool.query(
      'SELECT COUNT(*) as total FROM alert_rules WHERE user_id = $1 AND is_active = true',
      [userId]
    );
    const activeAlerts = parseInt(alertsResult.rows[0].total);

    // 获取竞争对手数量
    const competitorsResult = await dbService.pool.query(
      'SELECT COUNT(*) as total FROM competitors WHERE user_id = $1',
      [userId]
    );
    const totalCompetitors = parseInt(competitorsResult.rows[0].total);

    // 获取平均排名趋势（最近7天）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const rankingTrendResult = await dbService.pool.query(
      `SELECT DATE(gr.created_at) as date, AVG(gr.ranking) as avg_ranking
       FROM geo_results gr
       JOIN keywords k ON gr.keyword_id = k.id
       WHERE k.user_id = $1 AND gr.created_at >= $2
       GROUP BY DATE(gr.created_at)
       ORDER BY date`,
      [userId, sevenDaysAgo]
    );

    const rankingTrend = rankingTrendResult.rows.map(row => ({
      date: row.date,
      avgRanking: parseFloat(row.avg_ranking)
    }));

    res.json({
      success: true,
      data: {
        overview: {
          totalKeywords,
          todayGeoResults,
          activeAlerts,
          totalCompetitors
        },
        rankingTrend
      }
    });
  } catch (error) {
    console.error('获取仪表盘概览数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取仪表盘数据失败'
    });
  }
});

// 获取关键词性能数据
router.get('/keyword-performance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { limit = 10 } = req.query;

    const result = await dbService.pool.query(
      `SELECT 
         k.keyword,
         k.search_volume,
         AVG(gr.ranking) as avg_ranking,
         COUNT(gr.id) as total_results,
         MAX(gr.created_at) as last_updated
       FROM keywords k
       LEFT JOIN geo_results gr ON k.id = gr.keyword_id
       WHERE k.user_id = $1
       GROUP BY k.id, k.keyword, k.search_volume
       ORDER BY avg_ranking ASC NULLS LAST
       LIMIT $2`,
      [userId, limit]
    );

    const keywordPerformance = result.rows.map(row => ({
      keyword: row.keyword,
      searchVolume: row.search_volume,
      avgRanking: row.avg_ranking ? parseFloat(row.avg_ranking) : null,
      totalResults: parseInt(row.total_results),
      lastUpdated: row.last_updated
    }));

    res.json({
      success: true,
      data: keywordPerformance
    });
  } catch (error) {
    console.error('获取关键词性能数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取关键词性能数据失败'
    });
  }
});

// 获取竞争对手分析数据
router.get('/competitor-analysis', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;

    const result = await dbService.pool.query(
      `SELECT 
         c.name,
         c.domain,
         COUNT(cm.id) as mention_count,
         AVG(cm.ranking) as avg_ranking
       FROM competitors c
       LEFT JOIN competitor_mentions cm ON c.id = cm.competitor_id
       WHERE c.user_id = $1
       GROUP BY c.id, c.name, c.domain
       ORDER BY mention_count DESC
       LIMIT 5`,
      [userId]
    );

    const competitorAnalysis = result.rows.map(row => ({
      name: row.name,
      domain: row.domain,
      mentionCount: parseInt(row.mention_count),
      avgRanking: row.avg_ranking ? parseFloat(row.avg_ranking) : null
    }));

    res.json({
      success: true,
      data: competitorAnalysis
    });
  } catch (error) {
    console.error('获取竞争对手分析数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取竞争对手分析数据失败'
    });
  }
});

// 获取最近告警日志
router.get('/recent-alerts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { limit = 5 } = req.query;

    const result = await dbService.pool.query(
      `SELECT 
         al.id,
         al.alert_type,
         al.message,
         al.created_at,
         ar.name as rule_name
       FROM alert_logs al
       JOIN alert_rules ar ON al.alert_rule_id = ar.id
       WHERE ar.user_id = $1
       ORDER BY al.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    const recentAlerts = result.rows.map(row => ({
      id: row.id,
      alertType: row.alert_type,
      message: row.message,
      createdAt: row.created_at,
      ruleName: row.rule_name
    }));

    res.json({
      success: true,
      data: recentAlerts
    });
  } catch (error) {
    console.error('获取最近告警日志失败:', error);
    res.status(500).json({
      success: false,
      message: '获取告警日志失败'
    });
  }
});

export default router;