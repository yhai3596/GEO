import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Target, RefreshCw, Download, Settings } from 'lucide-react';
import { toast } from 'sonner';
import CompetitorAnalysisCard from '../components/analytics/CompetitorAnalysisCard';
import KeywordGapTable from '../components/analytics/KeywordGapTable';
import RankingTrendChart from '../components/analytics/RankingTrendChart';
import MarketShareChart from '../components/analytics/MarketShareChart';
import {
  analyticsService,
  CompetitorAnalysis,
  KeywordGapAnalysis,
  RankingTrendAnalysis,
  MarketShareAnalysis,
  AnalyticsReport
} from '../services/analyticsService';

const DataAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'competitors' | 'keyword-gap' | 'ranking-trend' | 'market-share'>('competitors');
  const [loading, setLoading] = useState(false);
  
  // 数据状态
  const [competitors, setCompetitors] = useState<CompetitorAnalysis[]>([]);
  const [keywordGap, setKeywordGap] = useState<KeywordGapAnalysis[]>([]);
  const [rankingTrend, setRankingTrend] = useState<RankingTrendAnalysis[]>([]);
  const [marketShare, setMarketShare] = useState<MarketShareAnalysis | null>(null);
  const [reports, setReports] = useState<AnalyticsReport[]>([]);

  // 配置状态
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>(['competitor1.com', 'competitor2.com']);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // 模拟数据
  const mockCompetitors: CompetitorAnalysis[] = [
    {
      id: 1,
      competitorName: '竞争对手A',
      domain: 'competitor-a.com',
      totalKeywords: 1250,
      avgRanking: 15.3,
      visibilityScore: 78.5,
      trafficEstimate: 45000,
      topKeywords: [
        { keyword: 'SEO优化', ranking: 3, searchVolume: 2200, difficulty: 65 },
        { keyword: '网站建设', ranking: 5, searchVolume: 1800, difficulty: 55 },
        { keyword: '数字营销', ranking: 2, searchVolume: 1500, difficulty: 70 },
        { keyword: '内容营销', ranking: 4, searchVolume: 1200, difficulty: 60 },
        { keyword: '社交媒体', ranking: 6, searchVolume: 1000, difficulty: 45 }
      ],
      rankingDistribution: [
        { range: '1-3', count: 45, percentage: 15.2 },
        { range: '4-10', count: 120, percentage: 40.5 },
        { range: '11-20', count: 85, percentage: 28.7 },
        { range: '21-50', count: 35, percentage: 11.8 },
        { range: '51+', count: 11, percentage: 3.8 }
      ],
      monthlyTrend: [
        { month: '2024-01', avgRanking: 18.2, visibilityScore: 72.1 },
        { month: '2024-02', avgRanking: 16.8, visibilityScore: 75.3 },
        { month: '2024-03', avgRanking: 15.3, visibilityScore: 78.5 }
      ]
    },
    {
      id: 2,
      competitorName: '竞争对手B',
      domain: 'competitor-b.com',
      totalKeywords: 980,
      avgRanking: 22.1,
      visibilityScore: 65.2,
      trafficEstimate: 32000,
      topKeywords: [
        { keyword: '网络推广', ranking: 2, searchVolume: 1900, difficulty: 68 },
        { keyword: '品牌建设', ranking: 4, searchVolume: 1400, difficulty: 62 },
        { keyword: '市场分析', ranking: 3, searchVolume: 1100, difficulty: 58 },
        { keyword: '用户体验', ranking: 5, searchVolume: 950, difficulty: 52 },
        { keyword: '转化优化', ranking: 7, searchVolume: 800, difficulty: 48 }
      ],
      rankingDistribution: [
        { range: '1-3', count: 28, percentage: 12.1 },
        { range: '4-10', count: 95, percentage: 41.1 },
        { range: '11-20', count: 72, percentage: 31.2 },
        { range: '21-50', count: 28, percentage: 12.1 },
        { range: '51+', count: 8, percentage: 3.5 }
      ],
      monthlyTrend: [
        { month: '2024-01', avgRanking: 25.3, visibilityScore: 58.9 },
        { month: '2024-02', avgRanking: 23.7, visibilityScore: 62.1 },
        { month: '2024-03', avgRanking: 22.1, visibilityScore: 65.2 }
      ]
    }
  ];

  const mockKeywordGap: KeywordGapAnalysis[] = [
    {
      keyword: 'AI营销工具',
      searchVolume: 3200,
      difficulty: 72,
      myRanking: null,
      competitorRankings: [
        { competitor: '竞争对手A', ranking: 4 },
        { competitor: '竞争对手B', ranking: 8 }
      ],
      opportunity: 'high',
      estimatedTraffic: 1280
    },
    {
      keyword: '自动化营销',
      searchVolume: 2800,
      difficulty: 65,
      myRanking: 15,
      competitorRankings: [
        { competitor: '竞争对手A', ranking: 3 },
        { competitor: '竞争对手B', ranking: 6 }
      ],
      opportunity: 'medium',
      estimatedTraffic: 980
    },
    {
      keyword: '数据驱动营销',
      searchVolume: 2100,
      difficulty: 58,
      myRanking: null,
      competitorRankings: [
        { competitor: '竞争对手A', ranking: 2 },
        { competitor: '竞争对手B', ranking: 12 }
      ],
      opportunity: 'high',
      estimatedTraffic: 840
    }
  ];

  const mockRankingTrend: RankingTrendAnalysis[] = [
    {
      keyword: 'SEO优化',
      currentRanking: 8,
      previousRanking: 12,
      change: -4,
      trend: 'up',
      history: [
        { date: '2024-03-01', ranking: 12 },
        { date: '2024-03-08', ranking: 11 },
        { date: '2024-03-15', ranking: 9 },
        { date: '2024-03-22', ranking: 8 },
        { date: '2024-03-29', ranking: 8 }
      ],
      searchVolume: 2200,
      difficulty: 65
    },
    {
      keyword: '网站建设',
      currentRanking: 15,
      previousRanking: 13,
      change: 2,
      trend: 'down',
      history: [
        { date: '2024-03-01', ranking: 13 },
        { date: '2024-03-08', ranking: 14 },
        { date: '2024-03-15', ranking: 15 },
        { date: '2024-03-22', ranking: 15 },
        { date: '2024-03-29', ranking: 15 }
      ],
      searchVolume: 1800,
      difficulty: 55
    }
  ];

  const mockMarketShare: MarketShareAnalysis = {
    totalMarketSize: 125000,
    myShare: 15000,
    mySharePercentage: 12.0,
    competitors: [
      { name: '竞争对手A', share: 35000, sharePercentage: 28.0, change: 2.5 },
      { name: '竞争对手B', share: 25000, sharePercentage: 20.0, change: -1.2 },
      { name: '竞争对手C', share: 20000, sharePercentage: 16.0, change: 0.8 },
      { name: '其他', share: 30000, sharePercentage: 24.0, change: -1.1 }
    ],
    topKeywords: [
      {
        keyword: 'SEO优化',
        totalSearchVolume: 8500,
        myRanking: 8,
        topCompetitor: { name: '竞争对手A', ranking: 3 }
      },
      {
        keyword: '网站建设',
        totalSearchVolume: 6200,
        myRanking: 15,
        topCompetitor: { name: '竞争对手B', ranking: 5 }
      }
    ]
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      switch (activeTab) {
        case 'competitors':
          setCompetitors(mockCompetitors);
          break;
        case 'keyword-gap':
          setKeywordGap(mockKeywordGap);
          break;
        case 'ranking-trend':
          setRankingTrend(mockRankingTrend);
          break;
        case 'market-share':
          setMarketShare(mockMarketShare);
          break;
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleExport = async () => {
    try {
      toast.success('报告导出功能开发中...');
    } catch (error) {
      toast.error('导出失败');
    }
  };

  const handleViewCompetitorDetails = (competitor: CompetitorAnalysis) => {
    toast.info(`查看 ${competitor.competitorName} 详细分析功能开发中...`);
  };

  const tabs = [
    { id: 'competitors', name: '竞争对手分析', icon: Users },
    { id: 'keyword-gap', name: '关键词差距', icon: Target },
    { id: 'ranking-trend', name: '排名趋势', icon: TrendingUp },
    { id: 'market-share', name: '市场份额', icon: BarChart3 }
  ];

  return (
    <div className="min-h-full bg-gray-50">
      <div className="p-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">数据分析</h1>
          <p className="mt-1 text-sm text-gray-600">
            深度分析竞争对手表现，发现关键词机会，跟踪排名趋势
          </p>
        </div>

        {/* 操作栏 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* 标签页 */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>刷新</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>导出报告</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                <Settings className="h-4 w-4" />
                <span>分析设置</span>
              </button>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="space-y-6">
          {activeTab === 'competitors' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {competitors.map((competitor) => (
                  <CompetitorAnalysisCard
                    key={competitor.id}
                    competitor={competitor}
                    onViewDetails={handleViewCompetitorDetails}
                  />
                ))}
              </div>
              {competitors.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-500">暂无竞争对手数据</div>
                  <div className="text-sm text-gray-400 mt-1">请先添加竞争对手进行分析</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'keyword-gap' && (
            <KeywordGapTable data={keywordGap} loading={loading} />
          )}

          {activeTab === 'ranking-trend' && (
            <RankingTrendChart data={rankingTrend} loading={loading} />
          )}

          {activeTab === 'market-share' && marketShare && (
            <MarketShareChart data={marketShare} loading={loading} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DataAnalysis;