import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { KeywordGapAnalysis } from '../../services/analyticsService';

interface KeywordGapTableProps {
  data: KeywordGapAnalysis[];
  loading?: boolean;
}

const KeywordGapTable: React.FC<KeywordGapTableProps> = ({ data, loading = false }) => {
  const [sortBy, setSortBy] = useState<'searchVolume' | 'difficulty' | 'estimatedTraffic' | 'opportunity'>('estimatedTraffic');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterOpportunity, setFilterOpportunity] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const handleSort = (field: typeof sortBy) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getOpportunityIcon = (opportunity: string) => {
    switch (opportunity) {
      case 'high':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOpportunityText = (opportunity: string) => {
    switch (opportunity) {
      case 'high':
        return '高机会';
      case 'medium':
        return '中等机会';
      case 'low':
        return '低机会';
      default:
        return '未知';
    }
  };

  const filteredData = data.filter(item => 
    filterOpportunity === 'all' || item.opportunity === filterOpportunity
  );

  const sortedData = [...filteredData].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (sortBy) {
      case 'searchVolume':
        aValue = a.searchVolume;
        bValue = b.searchVolume;
        break;
      case 'difficulty':
        aValue = a.difficulty;
        bValue = b.difficulty;
        break;
      case 'estimatedTraffic':
        aValue = a.estimatedTraffic;
        bValue = b.estimatedTraffic;
        break;
      case 'opportunity':
        const opportunityOrder = { high: 3, medium: 2, low: 1 };
        aValue = opportunityOrder[a.opportunity as keyof typeof opportunityOrder];
        bValue = opportunityOrder[b.opportunity as keyof typeof opportunityOrder];
        break;
      default:
        return 0;
    }

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const getSortIcon = (field: string) => {
    if (field !== sortBy) return null;
    return sortOrder === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 筛选器 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">关键词差距分析</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">机会等级:</label>
              <select
                value={filterOpportunity}
                onChange={(e) => setFilterOpportunity(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部</option>
                <option value="high">高机会</option>
                <option value="medium">中等机会</option>
                <option value="low">低机会</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                关键词
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('searchVolume')}
              >
                <div className="flex items-center space-x-1">
                  <span>搜索量</span>
                  {getSortIcon('searchVolume')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('difficulty')}
              >
                <div className="flex items-center space-x-1">
                  <span>难度</span>
                  {getSortIcon('difficulty')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                我的排名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                竞争对手排名
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('opportunity')}
              >
                <div className="flex items-center space-x-1">
                  <span>机会等级</span>
                  {getSortIcon('opportunity')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('estimatedTraffic')}
              >
                <div className="flex items-center space-x-1">
                  <span>预估流量</span>
                  {getSortIcon('estimatedTraffic')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{item.keyword}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.searchVolume.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.difficulty}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {item.myRanking ? (
                    <span className="text-blue-600 font-medium">#{item.myRanking}</span>
                  ) : (
                    <span className="text-gray-400">未排名</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {item.competitorRankings.slice(0, 3).map((comp, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{comp.competitor}</span>
                        <span className="font-medium text-gray-900">#{comp.ranking}</span>
                      </div>
                    ))}
                    {item.competitorRankings.length > 3 && (
                      <div className="text-xs text-gray-400">
                        +{item.competitorRankings.length - 3} 更多
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getOpportunityColor(item.opportunity)}`}>
                    {getOpportunityIcon(item.opportunity)}
                    <span>{getOpportunityText(item.opportunity)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.estimatedTraffic.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">没有找到关键词差距数据</div>
        </div>
      )}
    </div>
  );
};

export default KeywordGapTable;