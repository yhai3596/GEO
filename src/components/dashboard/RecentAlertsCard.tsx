import React from 'react';
import { AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { RecentAlert } from '../../services/dashboardService';

interface RecentAlertsCardProps {
  data: RecentAlert[];
}

const RecentAlertsCard: React.FC<RecentAlertsCardProps> = ({ data }) => {
  const getAlertIcon = (alertType: string) => {
    switch (alertType.toLowerCase()) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertBgColor = (alertType: string) => {
    switch (alertType.toLowerCase()) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">最近告警</h3>
        <p className="text-sm text-gray-600">系统告警和通知</p>
      </div>
      
      {data.length > 0 ? (
        <div className="space-y-3">
          {data.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-4 rounded-lg border ${getAlertBgColor(alert.alertType)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.alertType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {alert.ruleName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(alert.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {alert.message}
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {alert.alertType}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无告警信息</p>
        </div>
      )}
    </div>
  );
};

export default RecentAlertsCard;