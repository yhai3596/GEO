import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// 竞争对手分析数据接口
export interface CompetitorAnalysis {
  id: number;
  competitorName: string;
  domain: string;
  totalKeywords: number;
  avgRanking: number;
  visibilityScore: number;
  trafficEstimate: number;
  topKeywords: {
    keyword: string;
    ranking: number;
    searchVolume: number;
    difficulty: number;
  }[];
  rankingDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  monthlyTrend: {
    month: string;
    avgRanking: number;
    visibilityScore: number;
  }[];
}

// 关键词差距分析
export interface KeywordGapAnalysis {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  myRanking: number | null;
  competitorRankings: {
    competitor: string;
    ranking: number;
  }[];
  opportunity: 'high' | 'medium' | 'low';
  estimatedTraffic: number;
}

// 排名趋势分析
export interface RankingTrendAnalysis {
  keyword: string;
  currentRanking: number;
  previousRanking: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  history: {
    date: string;
    ranking: number;
  }[];
  searchVolume: number;
  difficulty: number;
}

// 市场份额分析
export interface MarketShareAnalysis {
  totalMarketSize: number;
  myShare: number;
  mySharePercentage: number;
  competitors: {
    name: string;
    share: number;
    sharePercentage: number;
    change: number;
  }[];
  topKeywords: {
    keyword: string;
    totalSearchVolume: number;
    myRanking: number | null;
    topCompetitor: {
      name: string;
      ranking: number;
    };
  }[];
}

// 内容差距分析
export interface ContentGapAnalysis {
  missingTopics: {
    topic: string;
    keywords: string[];
    totalSearchVolume: number;
    avgDifficulty: number;
    competitorCoverage: {
      competitor: string;
      keywordCount: number;
      avgRanking: number;
    }[];
  }[];
  underperformingContent: {
    keyword: string;
    currentRanking: number;
    potentialRanking: number;
    searchVolume: number;
    competitorAnalysis: {
      competitor: string;
      ranking: number;
      contentScore: number;
    }[];
  }[];
}

// 分析报告
export interface AnalyticsReport {
  id: number;
  title: string;
  type: 'competitor' | 'keyword_gap' | 'ranking_trend' | 'market_share' | 'content_gap';
  status: 'generating' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  summary: string;
  insights: string[];
  recommendations: string[];
  data: any;
}

class AnalyticsService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // 获取竞争对手分析
  async getCompetitorAnalysis(competitorId?: number): Promise<CompetitorAnalysis[]> {
    try {
      const url = competitorId 
        ? `${API_BASE_URL}/api/analytics/competitors/${competitorId}`
        : `${API_BASE_URL}/api/analytics/competitors`;
      
      const response = await axios.get(url, {
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('获取竞争对手分析失败:', error);
      throw error;
    }
  }

  // 获取关键词差距分析
  async getKeywordGapAnalysis(competitors: string[]): Promise<KeywordGapAnalysis[]> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/analytics/keyword-gap`, {
        competitors
      }, {
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('获取关键词差距分析失败:', error);
      throw error;
    }
  }

  // 获取排名趋势分析
  async getRankingTrendAnalysis(
    keywords?: string[], 
    timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<RankingTrendAnalysis[]> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/analytics/ranking-trend`, {
        keywords,
        timeRange
      }, {
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('获取排名趋势分析失败:', error);
      throw error;
    }
  }

  // 获取市场份额分析
  async getMarketShareAnalysis(): Promise<MarketShareAnalysis> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/analytics/market-share`, {
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('获取市场份额分析失败:', error);
      throw error;
    }
  }

  // 获取内容差距分析
  async getContentGapAnalysis(competitors: string[]): Promise<ContentGapAnalysis> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/analytics/content-gap`, {
        competitors
      }, {
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('获取内容差距分析失败:', error);
      throw error;
    }
  }

  // 生成分析报告
  async generateReport(
    type: AnalyticsReport['type'],
    config: any
  ): Promise<{ reportId: number }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/analytics/reports`, {
        type,
        config
      }, {
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('生成分析报告失败:', error);
      throw error;
    }
  }

  // 获取分析报告列表
  async getReports(): Promise<AnalyticsReport[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/analytics/reports`, {
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('获取分析报告失败:', error);
      throw error;
    }
  }

  // 获取单个分析报告
  async getReport(reportId: number): Promise<AnalyticsReport> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/analytics/reports/${reportId}`, {
        headers: this.getAuthHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('获取分析报告详情失败:', error);
      throw error;
    }
  }

  // 删除分析报告
  async deleteReport(reportId: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/api/analytics/reports/${reportId}`, {
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('删除分析报告失败:', error);
      throw error;
    }
  }

  // 导出分析报告
  async exportReport(reportId: number, format: 'pdf' | 'excel'): Promise<Blob> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/analytics/reports/${reportId}/export?format=${format}`,
        {
          headers: this.getAuthHeaders(),
          responseType: 'blob'
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('导出分析报告失败:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();