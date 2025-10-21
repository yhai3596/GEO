import React, { useState, useEffect } from 'react';
import { X, Save, Bell, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AlertRule } from '../../services/settingsService';

interface AlertRuleFormProps {
  rule?: AlertRule;
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt' | 'lastTriggered' | 'triggerCount'>) => void;
}

const AlertRuleForm: React.FC<AlertRuleFormProps> = ({
  rule,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'ranking_drop' as AlertRule['type'],
    enabled: true,
    conditions: [
      {
        metric: 'ranking',
        operator: 'gt' as const,
        value: 5,
        timeframe: '1d'
      }
    ],
    actions: [
      {
        type: 'email' as const,
        config: { to: '' }
      }
    ]
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name,
        type: rule.type,
        enabled: rule.enabled,
        conditions: [...rule.conditions] as any,
        actions: [...rule.actions] as any
      });
    } else {
      setFormData({
        name: '',
        type: 'ranking_drop',
        enabled: true,
        conditions: [
          {
            metric: 'ranking',
            operator: 'gt',
            value: 5,
            timeframe: '1d'
          }
        ],
        actions: [
          {
            type: 'email',
            config: { to: '' }
          }
        ]
      });
    }
  }, [rule, isOpen]);

  const ruleTypes = [
    { value: 'ranking_drop', label: '排名下降' },
    { value: 'competitor_change', label: '竞争对手变化' },
    { value: 'keyword_opportunity', label: '关键词机会' },
    { value: 'traffic_anomaly', label: '流量异常' }
  ];

  const metrics = {
    ranking_drop: [
      { value: 'ranking', label: '排名位置' },
      { value: 'ranking_change', label: '排名变化' }
    ],
    competitor_change: [
      { value: 'competitor_ranking', label: '竞争对手排名' },
      { value: 'new_keywords', label: '新增关键词数' }
    ],
    keyword_opportunity: [
      { value: 'search_volume', label: '搜索量' },
      { value: 'difficulty', label: '竞争难度' }
    ],
    traffic_anomaly: [
      { value: 'traffic', label: '流量' },
      { value: 'traffic_change', label: '流量变化率' }
    ]
  };

  const operators = [
    { value: 'gt', label: '大于' },
    { value: 'lt', label: '小于' },
    { value: 'eq', label: '等于' },
    { value: 'gte', label: '大于等于' },
    { value: 'lte', label: '小于等于' }
  ];

  const timeframes = [
    { value: '1h', label: '1小时' },
    { value: '1d', label: '1天' },
    { value: '7d', label: '7天' },
    { value: '30d', label: '30天' }
  ];

  const actionTypes = [
    { value: 'email', label: '邮件通知' },
    { value: 'webhook', label: 'Webhook' },
    { value: 'sms', label: '短信通知' }
  ];

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          metric: metrics[prev.type][0].value,
          operator: 'gt' as any,
          value: 0,
          timeframe: '1d'
        }
      ]
    }));
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const updateCondition = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) =>
        i === index ? { ...condition, [field]: value } : condition
      )
    }));
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [
        ...prev.actions,
        {
          type: 'email' as any,
          config: { to: '' }
        }
      ]
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const updateAction = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) =>
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const updateActionConfig = (index: number, key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) =>
        i === index ? { ...action, config: { ...action.config, [key]: value } } : action
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('请输入规则名称');
      return;
    }

    if (formData.conditions.length === 0) {
      toast.error('至少需要一个触发条件');
      return;
    }

    if (formData.actions.length === 0) {
      toast.error('至少需要一个通知方式');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      toast.success(rule ? '告警规则更新成功' : '告警规则创建成功');
      onClose();
    } catch (error) {
      toast.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Bell className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {rule ? '编辑告警规则' : '创建告警规则'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">基本信息</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                规则名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入告警规则名称"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                规则类型 *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as AlertRule['type'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {ruleTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enabled" className="ml-2 text-sm text-gray-700">
                启用告警规则
              </label>
            </div>
          </div>

          {/* 触发条件 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">触发条件</h3>
              <button
                type="button"
                onClick={addCondition}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>添加条件</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.conditions.map((condition, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">条件 {index + 1}</span>
                    {formData.conditions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCondition(index)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">指标</label>
                      <select
                        value={condition.metric}
                        onChange={(e) => updateCondition(index, 'metric', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      >
                        {metrics[formData.type].map(metric => (
                          <option key={metric.value} value={metric.value}>
                            {metric.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">操作符</label>
                      <select
                        value={condition.operator}
                        onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      >
                        {operators.map(op => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">阈值</label>
                      <input
                        type="number"
                        value={condition.value}
                        onChange={(e) => updateCondition(index, 'value', parseFloat(e.target.value))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">时间范围</label>
                      <select
                        value={condition.timeframe}
                        onChange={(e) => updateCondition(index, 'timeframe', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      >
                        {timeframes.map(tf => (
                          <option key={tf.value} value={tf.value}>
                            {tf.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 通知方式 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">通知方式</h3>
              <button
                type="button"
                onClick={addAction}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>添加通知</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.actions.map((action, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">通知方式 {index + 1}</span>
                    {formData.actions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAction(index)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">通知类型</label>
                      <select
                        value={action.type}
                        onChange={(e) => updateAction(index, 'type', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      >
                        {actionTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {action.type === 'email' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">邮箱地址</label>
                        <input
                          type="email"
                          value={action.config.to || ''}
                          onChange={(e) => updateActionConfig(index, 'to', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          placeholder="输入邮箱地址"
                        />
                      </div>
                    )}
                    
                    {(action.type as any) === 'webhook' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Webhook URL</label>
                        <input
                          type="url"
                          value={(action.config as any).url || ''}
                          onChange={(e) => updateActionConfig(index, 'url', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          placeholder="输入Webhook URL"
                        />
                      </div>
                    )}
                    
                    {(action.type as any) === 'sms' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">手机号码</label>
                        <input
                          type="tel"
                          value={(action.config as any).phone || ''}
                          onChange={(e) => updateActionConfig(index, 'phone', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          placeholder="输入手机号码"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? '保存中...' : '保存'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertRuleForm;