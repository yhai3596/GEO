import React, { useState, useEffect } from 'react';
import { Search, Target, AlertTriangle, Users, RefreshCw } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RankingTrendChart from '../components/dashboard/RankingTrendChart';
import KeywordPerformanceTable from '../components/dashboard/KeywordPerformanceTable';
import CompetitorAnalysisCard from '../components/dashboard/CompetitorAnalysisCard';
import RecentAlertsCard from '../components/dashboard/RecentAlertsCard';
import { 
  dashboardService, 
  DashboardData, 
  KeywordPerformance, 
  CompetitorAnalysis, 
  RecentAlert 
} from '../services/dashboardService';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [keywordPerformance, setKeywordPerformance] = useState<KeywordPerformance[]>([]);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorAnalysis[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overview, keywords, competitors, alerts] = await Promise.all([
        dashboardService.getDashboardOverview(),
        dashboardService.getKeywordPerformance(10),
        dashboardService.getCompetitorAnalysis(),
        dashboardService.getRecentAlerts(5)
      ]);

      setDashboardData(overview);
      setKeywordPerformance(keywords);
      setCompetitorAnalysis(competitors);
      setRecentAlerts(alerts);
    } catch (err) {
      console.error('加载仪表盘数据失败:', err);
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">加载中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
              <p className="text-sm text-gray-600">GEO智能评估平台概览</p>
            </div>
            <button
              onClick={loadDashboardData}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>刷新</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="关键词总数"
            value={dashboardData?.overview.totalKeywords || 0}
            icon={Search}
            color="blue"
          />
          <StatCard
            title="今日GEO结果"
            value={dashboardData?.overview.todayGeoResults || 0}
            icon={Target}
            color="green"
          />
          <StatCard
            title="活跃告警"
            value={dashboardData?.overview.activeAlerts || 0}
            icon={AlertTriangle}
            color="yellow"
          />
          <StatCard
            title="竞争对手"
            value={dashboardData?.overview.totalCompetitors || 0}
            icon={Users}
            color="red"
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Ranking Trend Chart */}
          <RankingTrendChart data={dashboardData?.rankingTrend || []} />
          
          {/* Recent Alerts */}
          <RecentAlertsCard data={recentAlerts} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Keyword Performance Table */}
          <div className="lg:col-span-1">
            <KeywordPerformanceTable data={keywordPerformance} />
          </div>
          
          {/* Competitor Analysis */}
          <div className="lg:col-span-1">
            <CompetitorAnalysisCard data={competitorAnalysis} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;