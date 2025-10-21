import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bot, Bell, Key, User, Globe, Save, Plus } from 'lucide-react';
import { toast } from 'sonner';
import AIAgentCard from '../components/settings/AIAgentCard';
import AIAgentForm from '../components/settings/AIAgentForm';
import AlertRuleCard from '../components/settings/AlertRuleCard';
import AlertRuleForm from '../components/settings/AlertRuleForm';
import {
  settingsService,
  AIAgentConfig,
  AlertRule,
  SystemSettings,
  UserPreferences,
  APIKeyConfig
} from '../services/settingsService';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ai-agents' | 'alert-rules' | 'api-keys' | 'system' | 'preferences'>('ai-agents');
  const [loading, setLoading] = useState(false);

  // 数据状态
  const [aiAgents, setAiAgents] = useState<AIAgentConfig[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKeyConfig[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  // 表单状态
  const [showAIAgentForm, setShowAIAgentForm] = useState(false);
  const [showAlertRuleForm, setShowAlertRuleForm] = useState(false);
  const [editingAIAgent, setEditingAIAgent] = useState<AIAgentConfig | undefined>();
  const [editingAlertRule, setEditingAlertRule] = useState<AlertRule | undefined>();

  // 模拟数据
  const mockAIAgents: AIAgentConfig[] = [
    {
      id: 1,
      name: '关键词分析助手',
      type: 'keyword_analysis',
      enabled: true,
      config: {
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 1000,
        prompt: '分析以下关键词的搜索趋势、竞争难度和优化建议：',
        schedule: '0 9 * * *',
        targets: ['SEO优化', '网站建设', '数字营销'],
        thresholds: { ranking_drop: 5 }
      },
      lastRun: '2024-03-29T09:00:00Z',
      nextRun: '2024-03-30T09:00:00Z',
      status: 'active',
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2024-03-29T09:00:00Z'
    },
    {
      id: 2,
      name: '竞争对手监控',
      type: 'competitor_monitoring',
      enabled: true,
      config: {
        model: 'gpt-4',
        temperature: 0.5,
        maxTokens: 1500,
        prompt: '监控竞争对手的SEO表现变化，包括排名变动、新增关键词等：',
        schedule: '0 */6 * * *',
        targets: ['competitor-a.com', 'competitor-b.com'],
        thresholds: { ranking_change: 3 }
      },
      lastRun: '2024-03-29T12:00:00Z',
      nextRun: '2024-03-29T18:00:00Z',
      status: 'active',
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2024-03-29T12:00:00Z'
    }
  ];

  const mockAlertRules: AlertRule[] = [
    {
      id: 1,
      name: '关键词排名下降告警',
      type: 'ranking_drop',
      enabled: true,
      conditions: [
        {
          metric: 'ranking',
          operator: 'gt',
          value: 10,
          timeframe: '1d'
        }
      ],
      actions: [
        {
          type: 'email',
          config: { to: 'admin@example.com' }
        }
      ],
      lastTriggered: '2024-03-28T14:30:00Z',
      triggerCount: 5,
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2024-03-28T14:30:00Z'
    },
    {
      id: 2,
      name: '竞争对手新关键词告警',
      type: 'competitor_change',
      enabled: true,
      conditions: [
        {
          metric: 'new_keywords',
          operator: 'gte',
          value: 5,
          timeframe: '1d'
        }
      ],
      actions: [
        {
          type: 'email',
          config: { to: 'admin@example.com' }
        },
        {
          type: 'webhook',
          config: { url: 'https://hooks.slack.com/services/...' }
        }
      ],
      triggerCount: 2,
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2024-03-25T10:15:00Z'
    }
  ];

  const mockApiKeys: APIKeyConfig[] = [
    {
      id: 1,
      name: 'OpenAI API Key',
      service: 'openai',
      keyValue: 'sk-*********************',
      enabled: true,
      lastUsed: '2024-03-29T12:00:00Z',
      usageCount: 1250,
      createdAt: '2024-03-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Google Search Console',
      service: 'google',
      keyValue: 'AIza*********************',
      enabled: true,
      lastUsed: '2024-03-29T09:00:00Z',
      usageCount: 850,
      createdAt: '2024-03-01T00:00:00Z',
      expiresAt: '2024-12-31T23:59:59Z'
    }
  ];

  const mockSystemSettings: SystemSettings = {
    general: {
      siteName: 'GEO智能评估平台',
      timezone: 'Asia/Shanghai',
      language: 'zh-CN',
      dateFormat: 'YYYY-MM-DD'
    },
    api: {
      rateLimit: 1000,
      timeout: 30000,
      retryAttempts: 3
    },
    data: {
      retentionDays: 365,
      backupEnabled: true,
      backupFrequency: 'daily'
    },
    notifications: {
      emailEnabled: true,
      emailFrom: 'noreply@geo-platform.com',
      webhookUrl: 'https://hooks.slack.com/services/...'
    }
  };

  const mockUserPreferences: UserPreferences = {
    dashboard: {
      defaultView: 'overview',
      refreshInterval: 300,
      chartsEnabled: true
    },
    reports: {
      defaultFormat: 'pdf',
      includeCharts: true,
      autoGenerate: false
    },
    notifications: {
      email: true,
      browser: true,
      frequency: 'immediate'
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      switch (activeTab) {
        case 'ai-agents':
          setAiAgents(mockAIAgents);
          break;
        case 'alert-rules':
          setAlertRules(mockAlertRules);
          break;
        case 'api-keys':
          setApiKeys(mockApiKeys);
          break;
        case 'system':
          setSystemSettings(mockSystemSettings);
          break;
        case 'preferences':
          setUserPreferences(mockUserPreferences);
          break;
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // AI智能体操作
  const handleCreateAIAgent = async (agent: Omit<AIAgentConfig, 'id' | 'createdAt' | 'updatedAt' | 'lastRun' | 'nextRun' | 'status'>) => {
    try {
      const newAgent: AIAgentConfig = {
        ...agent,
        id: Date.now(),
        status: 'inactive',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setAiAgents(prev => [...prev, newAgent]);
      toast.success('智能体创建成功');
    } catch (error) {
      toast.error('创建失败');
    }
  };

  const handleEditAIAgent = (agent: AIAgentConfig) => {
    setEditingAIAgent(agent);
    setShowAIAgentForm(true);
  };

  const handleUpdateAIAgent = async (updatedAgent: Omit<AIAgentConfig, 'id' | 'createdAt' | 'updatedAt' | 'lastRun' | 'nextRun' | 'status'>) => {
    try {
      setAiAgents(prev => prev.map(agent => 
        agent.id === editingAIAgent?.id 
          ? { ...agent, ...updatedAgent, updatedAt: new Date().toISOString() }
          : agent
      ));
      toast.success('智能体更新成功');
    } catch (error) {
      toast.error('更新失败');
    }
  };

  const handleDeleteAIAgent = async (id: number) => {
    try {
      setAiAgents(prev => prev.filter(agent => agent.id !== id));
      toast.success('智能体删除成功');
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const handleToggleAIAgent = async (id: number, enabled: boolean) => {
    try {
      setAiAgents(prev => prev.map(agent => 
        agent.id === id ? { ...agent, enabled, updatedAt: new Date().toISOString() } : agent
      ));
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const handleRunAIAgent = async (id: number) => {
    try {
      setAiAgents(prev => prev.map(agent => 
        agent.id === id 
          ? { 
              ...agent, 
              lastRun: new Date().toISOString(),
              status: 'active',
              updatedAt: new Date().toISOString()
            }
          : agent
      ));
      toast.success('智能体运行成功');
    } catch (error) {
      toast.error('运行失败');
    }
  };

  // 告警规则操作
  const handleCreateAlertRule = async (rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt' | 'lastTriggered' | 'triggerCount'>) => {
    try {
      const newRule: AlertRule = {
        ...rule,
        id: Date.now(),
        triggerCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setAlertRules(prev => [...prev, newRule]);
      toast.success('告警规则创建成功');
    } catch (error) {
      toast.error('创建失败');
    }
  };

  const handleEditAlertRule = (rule: AlertRule) => {
    setEditingAlertRule(rule);
    setShowAlertRuleForm(true);
  };

  const handleUpdateAlertRule = async (updatedRule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt' | 'lastTriggered' | 'triggerCount'>) => {
    try {
      setAlertRules(prev => prev.map(rule => 
        rule.id === editingAlertRule?.id 
          ? { ...rule, ...updatedRule, updatedAt: new Date().toISOString() }
          : rule
      ));
      toast.success('告警规则更新成功');
    } catch (error) {
      toast.error('更新失败');
    }
  };

  const handleDeleteAlertRule = async (id: number) => {
    try {
      setAlertRules(prev => prev.filter(rule => rule.id !== id));
      toast.success('告警规则删除成功');
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const handleToggleAlertRule = async (id: number, enabled: boolean) => {
    try {
      setAlertRules(prev => prev.map(rule => 
        rule.id === id ? { ...rule, enabled, updatedAt: new Date().toISOString() } : rule
      ));
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const tabs = [
    { id: 'ai-agents', name: 'AI智能体', icon: Bot },
    { id: 'alert-rules', name: '告警规则', icon: Bell },
    { id: 'api-keys', name: 'API密钥', icon: Key },
    { id: 'system', name: '系统设置', icon: SettingsIcon },
    { id: 'preferences', name: '用户偏好', icon: User }
  ];

  return (
    <div className="min-h-full bg-gray-50">
      <div className="p-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
          <p className="mt-1 text-sm text-gray-600">
            配置AI智能体、告警规则和系统参数
          </p>
        </div>

        {/* 标签页导航 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex space-x-1 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="space-y-6">
          {activeTab === 'ai-agents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">AI智能体管理</h2>
                <button
                  onClick={() => {
                    setEditingAIAgent(undefined);
                    setShowAIAgentForm(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>创建智能体</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {aiAgents.map((agent) => (
                  <AIAgentCard
                    key={agent.id}
                    agent={agent}
                    onEdit={handleEditAIAgent}
                    onDelete={handleDeleteAIAgent}
                    onToggle={handleToggleAIAgent}
                    onRun={handleRunAIAgent}
                  />
                ))}
              </div>
              
              {aiAgents.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-500">暂无AI智能体</div>
                  <div className="text-sm text-gray-400 mt-1">点击上方按钮创建第一个智能体</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'alert-rules' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">告警规则管理</h2>
                <button
                  onClick={() => {
                    setEditingAlertRule(undefined);
                    setShowAlertRuleForm(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>创建告警规则</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {alertRules.map((rule) => (
                  <AlertRuleCard
                    key={rule.id}
                    rule={rule}
                    onEdit={handleEditAlertRule}
                    onDelete={handleDeleteAlertRule}
                    onToggle={handleToggleAlertRule}
                  />
                ))}
              </div>
              
              {alertRules.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-500">暂无告警规则</div>
                  <div className="text-sm text-gray-400 mt-1">点击上方按钮创建第一个告警规则</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'api-keys' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">API密钥管理</h2>
                <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>添加API密钥</span>
                </button>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          服务名称
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          密钥
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          使用次数
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          最后使用
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {apiKeys.map((key) => (
                        <tr key={key.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{key.name}</div>
                            <div className="text-sm text-gray-500">{key.service}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-mono">{key.keyValue}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              key.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {key.enabled ? '启用' : '禁用'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {key.usageCount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : '从未使用'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">编辑</button>
                            <button className="text-red-600 hover:text-red-900">删除</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && systemSettings && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">系统设置</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">常规设置</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">站点名称</label>
                      <input
                        type="text"
                        value={systemSettings.general.siteName}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">时区</label>
                      <select
                        value={systemSettings.general.timezone}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Asia/Shanghai">Asia/Shanghai</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">API设置</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">请求限制 (次/分钟)</label>
                      <input
                        type="number"
                        value={systemSettings.api.rateLimit}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">超时时间 (毫秒)</label>
                      <input
                        type="number"
                        value={systemSettings.api.timeout}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  <Save className="h-4 w-4" />
                  <span>保存设置</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && userPreferences && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">用户偏好</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">仪表盘设置</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">默认视图</label>
                      <select
                        value={userPreferences.dashboard.defaultView}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="overview">概览</option>
                        <option value="keywords">关键词</option>
                        <option value="analytics">分析</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">刷新间隔 (秒)</label>
                      <input
                        type="number"
                        value={userPreferences.dashboard.refreshInterval}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">通知设置</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={userPreferences.notifications.email}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">邮件通知</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={userPreferences.notifications.browser}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">浏览器通知</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  <Save className="h-4 w-4" />
                  <span>保存偏好</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI智能体表单 */}
      <AIAgentForm
        agent={editingAIAgent}
        isOpen={showAIAgentForm}
        onClose={() => {
          setShowAIAgentForm(false);
          setEditingAIAgent(undefined);
        }}
        onSave={editingAIAgent ? handleUpdateAIAgent : handleCreateAIAgent}
      />

      {/* 告警规则表单 */}
      <AlertRuleForm
        rule={editingAlertRule}
        isOpen={showAlertRuleForm}
        onClose={() => {
          setShowAlertRuleForm(false);
          setEditingAlertRule(undefined);
        }}
        onSave={editingAlertRule ? handleUpdateAlertRule : handleCreateAlertRule}
      />
    </div>
  );
};

export default Settings;