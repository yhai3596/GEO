import React from 'react';
import { Bell, BellOff, Settings, Trash2, Mail, Webhook, MessageSquare, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { AlertRule } from '../../services/settingsService';

interface AlertRuleCardProps {
  rule: AlertRule;
  onEdit: (rule: AlertRule) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number, enabled: boolean) => void;
}

const AlertRuleCard: React.FC<AlertRuleCardProps> = ({
  rule,
  onEdit,
  onDelete,
  onToggle
}) => {
  const getRuleTypeLabel = (type: string) => {
    const labels = {
      ranking_drop: '排名下降',
      competitor_change: '竞争对手变化',
      keyword_opportunity: '关键词机会',
      traffic_anomaly: '流量异常'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getRuleTypeIcon = (type: string) => {
    switch (type) {
      case 'ranking_drop':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'competitor_change':
        return <Bell className="h-4 w-4 text-orange-500" />;
      case 'keyword_opportunity':
        return <Bell className="h-4 w-4 text-green-500" />;
      case 'traffic_anomaly':
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-3 w-3" />;
      case 'webhook':
        return <Webhook className="h-3 w-3" />;
      case 'sms':
        return <MessageSquare className="h-3 w-3" />;
      default:
        return <Bell className="h-3 w-3" />;
    }
  };

  const getOperatorLabel = (operator: string) => {
    const labels = {
      gt: '大于',
      lt: '小于',
      eq: '等于',
      gte: '大于等于',
      lte: '小于等于'
    };
    return labels[operator as keyof typeof labels] || operator;
  };

  const handleToggle = async () => {
    try {
      await onToggle(rule.id, !rule.enabled);
      toast.success(rule.enabled ? '告警规则已禁用' : '告警规则已启用');
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const handleDelete = () => {
    if (window.confirm('确定要删除这个告警规则吗？')) {
      onDelete(rule.id);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* 头部 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${rule.enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
            {getRuleTypeIcon(rule.type)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
            <p className="text-sm text-gray-600">{getRuleTypeLabel(rule.type)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            rule.enabled ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'
          }`}>
            {rule.enabled ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
            <span>{rule.enabled ? '已启用' : '已禁用'}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(rule)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="编辑"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="删除"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 条件信息 */}
      <div className="space-y-3 mb-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">触发条件:</h4>
          <div className="space-y-1">
            {rule.conditions.map((condition, index) => (
              <div key={index} className="text-sm text-gray-600 bg-gray-50 rounded px-2 py-1">
                {condition.metric} {getOperatorLabel(condition.operator)} {condition.value}
                {condition.timeframe && ` (${condition.timeframe})`}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">通知方式:</h4>
          <div className="flex items-center space-x-2">
            {rule.actions.map((action, index) => (
              <div key={index} className="flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                {getActionIcon(action.type)}
                <span>{action.type === 'email' ? '邮件' : action.type === 'webhook' ? 'Webhook' : '短信'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{rule.triggerCount}</div>
          <div className="text-xs text-gray-600">触发次数</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-900">
            {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleDateString() : '从未触发'}
          </div>
          <div className="text-xs text-gray-600">最后触发</div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={handleToggle}
          className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            rule.enabled
              ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
              : 'text-green-600 bg-green-50 hover:bg-green-100'
          }`}
        >
          {rule.enabled ? <BellOff className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
          <span>{rule.enabled ? '禁用' : '启用'}</span>
        </button>
        
        <div className="text-xs text-gray-500">
          创建于 {new Date(rule.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default AlertRuleCard;