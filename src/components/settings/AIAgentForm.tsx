import React, { useState, useEffect } from 'react';
import { X, Save, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { AIAgentConfig } from '../../services/settingsService';

interface AIAgentFormProps {
  agent?: AIAgentConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (agent: Omit<AIAgentConfig, 'id' | 'createdAt' | 'updatedAt' | 'lastRun' | 'nextRun' | 'status'>) => void;
}

const AIAgentForm: React.FC<AIAgentFormProps> = ({
  agent,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'keyword_analysis' as AIAgentConfig['type'],
    enabled: true,
    config: {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000,
      prompt: '',
      schedule: '0 9 * * *', // 每天9点
      targets: [] as string[],
      thresholds: {} as Record<string, number>
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        type: agent.type,
        enabled: agent.enabled,
        config: { ...agent.config } as any
      });
    } else {
      setFormData({
        name: '',
        type: 'keyword_analysis',
        enabled: true,
        config: {
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          maxTokens: 1000,
          prompt: '',
          schedule: '0 9 * * *',
          targets: [],
          thresholds: {}
        }
      });
    }
  }, [agent, isOpen]);

  const agentTypes = [
    { value: 'keyword_analysis', label: '关键词分析' },
    { value: 'competitor_monitoring', label: '竞争对手监控' },
    { value: 'content_optimization', label: '内容优化' },
    { value: 'ranking_prediction', label: '排名预测' }
  ];

  const models = [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku' }
  ];

  const scheduleOptions = [
    { value: '0 9 * * *', label: '每天 9:00' },
    { value: '0 9 * * 1', label: '每周一 9:00' },
    { value: '0 9 1 * *', label: '每月1号 9:00' },
    { value: '0 */6 * * *', label: '每6小时' },
    { value: '0 */1 * * *', label: '每小时' }
  ];

  const getDefaultPrompt = (type: string) => {
    const prompts = {
      keyword_analysis: '分析以下关键词的搜索趋势、竞争难度和优化建议：',
      competitor_monitoring: '监控竞争对手的SEO表现变化，包括排名变动、新增关键词等：',
      content_optimization: '基于SEO最佳实践，为以下内容提供优化建议：',
      ranking_prediction: '基于历史数据和当前趋势，预测关键词排名变化：'
    };
    return prompts[type as keyof typeof prompts] || '';
  };

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      type: type as AIAgentConfig['type'],
      config: {
        ...prev.config,
        prompt: getDefaultPrompt(type)
      }
    }));
  };

  const handleConfigChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value
      }
    }));
  };

  const handleTargetsChange = (value: string) => {
    const targets = value.split('\n').filter(t => t.trim());
    handleConfigChange('targets', targets);
  };

  const handleThresholdsChange = (key: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        thresholds: {
          ...prev.config.thresholds,
          [key]: value
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('请输入智能体名称');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      toast.success(agent ? '智能体更新成功' : '智能体创建成功');
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bot className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {agent ? '编辑智能体' : '创建智能体'}
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
                智能体名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入智能体名称"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                智能体类型 *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {agentTypes.map(type => (
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
                启用智能体
              </label>
            </div>
          </div>

          {/* AI配置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">AI配置</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI模型
                </label>
                <select
                  value={formData.config.model}
                  onChange={(e) => handleConfigChange('model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {models.map(model => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  温度 (0-1)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.config.temperature}
                  onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最大令牌数
                </label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={formData.config.maxTokens}
                  onChange={(e) => handleConfigChange('maxTokens', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  执行计划
                </label>
                <select
                  value={formData.config.schedule}
                  onChange={(e) => handleConfigChange('schedule', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {scheduleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提示词模板
              </label>
              <textarea
                value={formData.config.prompt}
                onChange={(e) => handleConfigChange('prompt', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入AI提示词模板..."
              />
            </div>
          </div>

          {/* 目标配置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">目标配置</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                监控目标 (每行一个)
              </label>
              <textarea
                value={formData.config.targets?.join('\n') || ''}
                onChange={(e) => handleTargetsChange(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入关键词、域名或其他监控目标，每行一个"
              />
            </div>

            {formData.type === 'ranking_prediction' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    排名下降阈值
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.config.thresholds?.ranking_drop || 5}
                    onChange={(e) => handleThresholdsChange('ranking_drop', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    流量下降阈值 (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.config.thresholds?.traffic_drop || 20}
                    onChange={(e) => handleThresholdsChange('traffic_drop', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
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

export default AIAgentForm;