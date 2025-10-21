import { ApiResponse } from '../../shared/types/database';

const API_BASE_URL = 'http://localhost:3001/api';

export interface DashboardOverview {
  totalKeywords: number;
  todayGeoResults: number;
  activeAlerts: number;
  totalCompetitors: number;
}

export interface RankingTrend {
  date: string;
  avgRanking: number;
}

export interface KeywordPerformance {
  keyword: string;
  searchVolume: number;
  avgRanking: number | null;
  totalResults: number;
  lastUpdated: string;
}

export interface CompetitorAnalysis {
  name: string;
  domain: string;
  mentionCount: number;
  avgRanking: number | null;
}

export interface RecentAlert {
  id: string;
  alertType: string;
  message: string;
  createdAt: string;
  ruleName: string;
}

export interface DashboardData {
  overview: DashboardOverview;
  rankingTrend: RankingTrend[];
}

class DashboardService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth-token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getDashboardOverview(): Promise<DashboardData> {
    const response = await fetch(`${API_BASE_URL}/dashboard/overview`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('获取仪表盘概览数据失败');
    }

    const result: ApiResponse<DashboardData> = await response.json();
    if (!result.success) {
      throw new Error(result.message || '获取仪表盘概览数据失败');
    }

    return result.data!;
  }

  async getKeywordPerformance(limit: number = 10): Promise<KeywordPerformance[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/keyword-performance?limit=${limit}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('获取关键词性能数据失败');
    }

    const result: ApiResponse<KeywordPerformance[]> = await response.json();
    if (!result.success) {
      throw new Error(result.message || '获取关键词性能数据失败');
    }

    return result.data!;
  }

  async getCompetitorAnalysis(): Promise<CompetitorAnalysis[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/competitor-analysis`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('获取竞争对手分析数据失败');
    }

    const result: ApiResponse<CompetitorAnalysis[]> = await response.json();
    if (!result.success) {
      throw new Error(result.message || '获取竞争对手分析数据失败');
    }

    return result.data!;
  }

  async getRecentAlerts(limit: number = 5): Promise<RecentAlert[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/recent-alerts?limit=${limit}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('获取最近告警日志失败');
    }

    const result: ApiResponse<RecentAlert[]> = await response.json();
    if (!result.success) {
      throw new Error(result.message || '获取告警日志失败');
    }

    return result.data!;
  }
}

export const dashboardService = new DashboardService();