import React from 'react';
import { TrendingUp, TrendingDown, Crown, Target } from 'lucide-react';
import { MarketShareAnalysis } from '../../services/analyticsService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface MarketShareChartProps {
  data: MarketShareAnalysis;
  loading?: boolean;
}

const MarketShareChart: React.FC<MarketShareChartProps> = ({ data, loading = false }) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

  // 准备饼图数据
  const pieData = [
    { name: '我的份额', value: data.myShare, color: '#3B82F6' },
    ...data.competitors.map((comp, index) => ({
      name: comp.name,
      value: comp.share,
      color: COLORS[(index + 1) % COLORS.length]
    }))
  ];

  // 准备柱状图数据
  const barData = [
    { 
      name: '我的表现', 
      share: data.myShare, 
      percentage: data.mySharePercentage,
      change: 0 // 假设我的变化为基准
    },
    ...data.competitors.map(comp => ({
      name: comp.name,
      share: comp.share,
      percentage: comp.sharePercentage,
      change: comp.change
    }))
  ].sort((a, b) => b.share - a.share);

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatChange = (change: number) => {
    if (change === 0) return '';
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* 标题和总览 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">市场份额分析</h3>
        
        {/* 关键指标 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">我的市场份额</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {data.mySharePercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-blue-700">
              {data.myShare.toLocaleString()} / {data.totalMarketSize.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">市场领导者</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {barData[0]?.name === '我的表现' ? '我' : barData[0]?.name}
            </div>
            <div className="text-sm text-gray-700">
              {barData[0]?.percentage.toFixed(1)}% 份额
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">总市场规模</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {data.totalMarketSize.toLocaleString()}
            </div>
            <div className="text-sm text-green-700">搜索量总和</div>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 饼图 */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">市场份额分布</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${(percentage || 0).toFixed(1)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString(), '搜索量']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 柱状图 */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">竞争对手对比</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()}`, '搜索量']}
                />
                <Bar dataKey="share" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 竞争对手详细列表 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">竞争对手排名</h4>
        <div className="space-y-3">
          {barData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {item.name === '我的表现' ? '我的表现' : item.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.share.toLocaleString()} 搜索量
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {item.percentage.toFixed(1)}%
                </div>
                {item.change !== 0 && (
                  <div className={`flex items-center space-x-1 text-sm ${getChangeColor(item.change)}`}>
                    {getChangeIcon(item.change)}
                    <span>{formatChange(item.change)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 顶级关键词机会 */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">顶级关键词机会</h4>
        <div className="space-y-3">
          {data.topKeywords.slice(0, 5).map((keyword, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{keyword.keyword}</div>
                <div className="text-sm text-gray-600">
                  搜索量: {keyword.totalSearchVolume.toLocaleString()}
                </div>
              </div>
              <div className="text-center mx-4">
                <div className="text-sm text-gray-600">我的排名</div>
                <div className="font-bold">
                  {keyword.myRanking ? `#${keyword.myRanking}` : '未排名'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">领先者</div>
                <div className="font-medium text-gray-900">{keyword.topCompetitor.name}</div>
                <div className="text-sm text-blue-600">#{keyword.topCompetitor.ranking}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketShareChart;