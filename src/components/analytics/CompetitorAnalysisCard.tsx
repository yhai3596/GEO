import React from 'react';
import { TrendingUp, TrendingDown, Minus, ExternalLink, Eye } from 'lucide-react';
import { CompetitorAnalysis } from '../../services/analyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface CompetitorAnalysisCardProps {
  competitor: CompetitorAnalysis;
  onViewDetails: (competitor: CompetitorAnalysis) => void;
}

const CompetitorAnalysisCard: React.FC<CompetitorAnalysisCardProps> = ({
  competitor,
  onViewDetails
}) => {
  const getVisibilityTrend = () => {
    if (competitor.monthlyTrend.length < 2) return 'stable';
    const current = competitor.monthlyTrend[competitor.monthlyTrend.length - 1].visibilityScore;
    const previous = competitor.monthlyTrend[competitor.monthlyTrend.length - 2].visibilityScore;
    
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getVisibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* 竞争对手基本信息 */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{competitor.competitorName}</h3>
            <a
              href={`https://${competitor.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="text-sm text-gray-600 mb-3">{competitor.domain}</p>
          
          {/* 关键指标 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">关键词数量</div>
              <div className="text-xl font-bold text-gray-900">{competitor.totalKeywords.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">平均排名</div>
              <div className="text-xl font-bold text-gray-900">{competitor.avgRanking.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">可见度评分</div>
              <div className={`text-xl font-bold ${getVisibilityColor(competitor.visibilityScore)} flex items-center space-x-1`}>
                <span>{competitor.visibilityScore.toFixed(1)}</span>
                {getTrendIcon(getVisibilityTrend())}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">预估流量</div>
              <div className="text-xl font-bold text-gray-900">{competitor.trafficEstimate.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => onViewDetails(competitor)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Eye className="h-4 w-4" />
          <span>查看详情</span>
        </button>
      </div>

      {/* 排名分布图表 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">排名分布</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={competitor.rankingDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value}个关键词`, '数量']}
                labelFormatter={(label) => `排名范围: ${label}`}
              />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 顶级关键词 */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">顶级关键词</h4>
        <div className="space-y-2">
          {competitor.topKeywords.slice(0, 5).map((keyword, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{keyword.keyword}</div>
                <div className="text-sm text-gray-600">
                  搜索量: {keyword.searchVolume.toLocaleString()} | 难度: {keyword.difficulty}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">#{keyword.ranking}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompetitorAnalysisCard;