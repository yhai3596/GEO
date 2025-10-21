import React, { useState } from 'react';
import { 
  Edit2, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  MoreHorizontal,
  Play,
  Pause
} from 'lucide-react';
import { Keyword } from '../../services/keywordService';

interface KeywordTableProps {
  keywords: Keyword[];
  selectedKeywords: string[];
  onSelectKeyword: (keywordId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onEditKeyword: (keyword: Keyword) => void;
  onDeleteKeyword: (keyword: Keyword) => void;
  onToggleStatus: (keyword: Keyword) => void;
  loading?: boolean;
}

const KeywordTable: React.FC<KeywordTableProps> = ({
  keywords,
  selectedKeywords,
  onSelectKeyword,
  onSelectAll,
  onEditKeyword,
  onDeleteKeyword,
  onToggleStatus,
  loading = false
}) => {
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: '活跃', className: 'bg-green-100 text-green-800' },
      paused: { label: '暂停', className: 'bg-yellow-100 text-yellow-800' },
      deleted: { label: '已删除', className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const allSelected = keywords.length > 0 && selectedKeywords.length === keywords.length;
  const someSelected = selectedKeywords.length > 0 && selectedKeywords.length < keywords.length;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('keyword')}
              >
                关键词
                {sortBy === 'keyword' && (
                  <span className="ml-1">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('search_volume')}
              >
                搜索量
                {sortBy === 'search_volume' && (
                  <span className="ml-1">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                难度
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                平均排名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                GEO结果
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('created_at')}
              >
                创建时间
                {sortBy === 'created_at' && (
                  <span className="ml-1">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keywords.map((keyword) => (
              <tr key={keyword.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedKeywords.includes(keyword.id)}
                    onChange={() => onSelectKeyword(keyword.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{keyword.keyword}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {keyword.searchVolume ? keyword.searchVolume.toLocaleString() : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {keyword.difficulty ? `${keyword.difficulty}%` : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getRankingIcon(keyword.avgRanking)}
                    <span className={`text-sm ${getRankingColor(keyword.avgRanking)}`}>
                      {keyword.avgRanking ? keyword.avgRanking.toFixed(1) : '-'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{keyword.geoResultsCount || 0}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(keyword.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatDate(keyword.createdAt)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onToggleStatus(keyword)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title={keyword.status === 'active' ? '暂停' : '激活'}
                    >
                      {keyword.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onEditKeyword(keyword)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteKeyword(keyword)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {keywords.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <MoreHorizontal className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">暂无关键词</p>
              <p className="text-sm">点击"添加关键词"开始管理您的关键词</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordTable;