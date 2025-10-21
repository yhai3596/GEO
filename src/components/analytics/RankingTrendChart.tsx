import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { RankingTrendAnalysis } from '../../services/analyticsService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RankingTrendChartProps {
  data: RankingTrendAnalysis[];
  loading?: boolean;
}

const RankingTrendChart: React.FC<RankingTrendChartProps> = ({ data, loading = false }) => {
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set(data.slice(0, 5).map(item => item.keyword)));
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

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

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeText = (change: number) => {
    if (change === 0) return '无变化';
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change}`;
  };

  // 准备图表数据
  const chartData = React.useMemo(() => {
    if (data.length === 0) return [];

    // 获取所有日期
    const allDates = new Set<string>();
    data.forEach(item => {
      item.history.forEach(point => {
        allDates.add(point.date);
      });
    });

    const sortedDates = Array.from(allDates).sort();

    return sortedDates.map(date => {
      const dataPoint: any = { date };
      
      data.forEach(item => {
        if (selectedKeywords.has(item.keyword)) {
          const historyPoint = item.history.find(h => h.date === date);
          if (historyPoint) {
            dataPoint[item.keyword] = historyPoint.ranking;
          }
        }
      });

      return dataPoint;
    });
  }, [data, selectedKeywords]);

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const toggleKeyword = (keyword: string) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(keyword)) {
      newSelected.delete(keyword);
    } else {
      newSelected.add(keyword);
    }
    setSelectedKeywords(newSelected);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* 标题和控制 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">排名趋势分析</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">时间范围:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">最近7天</option>
              <option value="30d">最近30天</option>
              <option value="90d">最近90天</option>
            </select>
          </div>
        </div>
      </div>

      {/* 关键词列表 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">选择关键词 (最多10个)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.map((item, index) => (
            <div
              key={item.keyword}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedKeywords.has(item.keyword)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleKeyword(item.keyword)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{item.keyword}</div>
                  <div className="text-sm text-gray-600">
                    当前排名: #{item.currentRanking}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-2">
                  <div className={`text-sm font-medium ${getTrendColor(item.trend)}`}>
                    {getChangeText(item.change)}
                  </div>
                  {getTrendIcon(item.trend)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 图表 */}
      {chartData.length > 0 && selectedKeywords.size > 0 ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis 
                reversed
                tick={{ fontSize: 12 }}
                label={{ value: '排名', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelFormatter={(value) => `日期: ${new Date(value).toLocaleDateString()}`}
                formatter={(value: number, name: string) => [`#${value}`, name]}
              />
              <Legend />
              {Array.from(selectedKeywords).map((keyword, index) => (
                <Line
                  key={keyword}
                  type="monotone"
                  dataKey={keyword}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center text-gray-500">
          {selectedKeywords.size === 0 ? '请选择要显示的关键词' : '暂无数据'}
        </div>
      )}

      {/* 统计信息 */}
      {selectedKeywords.size > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">选中关键词统计</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.filter(item => selectedKeywords.has(item.keyword) && item.trend === 'up').length}
              </div>
              <div className="text-sm text-gray-600">上升趋势</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {data.filter(item => selectedKeywords.has(item.keyword) && item.trend === 'down').length}
              </div>
              <div className="text-sm text-gray-600">下降趋势</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {data.filter(item => selectedKeywords.has(item.keyword) && item.trend === 'stable').length}
              </div>
              <div className="text-sm text-gray-600">稳定趋势</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingTrendChart;