import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KeywordPerformance } from '../../services/dashboardService';

interface KeywordPerformanceTableProps {
  data: KeywordPerformance[];
}

const KeywordPerformanceTable: React.FC<KeywordPerformanceTableProps> = ({ data }) => {
  const getRankingIcon = (ranking: number | null) => {
    if (ranking === null) return <Minus className="h-4 w-4 text-gray-400" />;
    if (ranking <= 3) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (ranking <= 10) return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getRankingColor = (ranking: number | null) => {
    if (ranking === null) return 'text-gray-500';
    if (ranking <= 3) return 'text-green-600 font-semibold';
    if (ranking <= 10) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">关键词性能</h3>
        <p className="text-sm text-gray-600">按平均排名排序的关键词表现</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                关键词
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                搜索量
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                平均排名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                结果数量
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                最后更新
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.keyword}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {item.searchVolume?.toLocaleString() || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getRankingIcon(item.avgRanking)}
                    <span className={`text-sm ${getRankingColor(item.avgRanking)}`}>
                      {item.avgRanking ? item.avgRanking.toFixed(1) : '-'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.totalResults}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatDate(item.lastUpdated)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {data.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">暂无关键词数据</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordPerformanceTable;