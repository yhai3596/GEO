import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CompetitorAnalysis } from '../../services/dashboardService';

interface CompetitorAnalysisCardProps {
  data: CompetitorAnalysis[];
}

const CompetitorAnalysisCard: React.FC<CompetitorAnalysisCardProps> = ({ data }) => {
  const chartData = data.map(item => ({
    name: item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name,
    fullName: item.name,
    mentions: item.mentionCount,
    avgRanking: item.avgRanking || 0
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">竞争对手分析</h3>
        <p className="text-sm text-gray-600">竞争对手提及次数统计</p>
      </div>
      
      {data.length > 0 ? (
        <>
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number, name: string) => [
                    value, 
                    name === 'mentions' ? '提及次数' : '平均排名'
                  ]}
                  labelFormatter={(label) => {
                    const item = chartData.find(d => d.name === label);
                    return item ? item.fullName : label;
                  }}
                />
                <Bar 
                  dataKey="mentions" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3">
            {data.map((competitor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{competitor.name}</h4>
                  <p className="text-sm text-gray-600">{competitor.domain}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {competitor.mentionCount} 次提及
                  </div>
                  <div className="text-sm text-gray-600">
                    平均排名: {competitor.avgRanking ? competitor.avgRanking.toFixed(1) : '-'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">暂无竞争对手数据</p>
        </div>
      )}
    </div>
  );
};

export default CompetitorAnalysisCard;