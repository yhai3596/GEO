import axios from 'axios';

// AI智能体配置接口
export interface AIAgentConfig {
  id: number;
  name: string;
  type: 'keyword_analysis' | 'competitor_monitoring' | 'content_optimization' | 'ranking_prediction';
  enabled: boolean;
  config: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    prompt?: string;
    schedule?: string;
    targets?: string[];
    thresholds?: Record<string, number>;
  };
  lastRun?: string;
  nextRun?: string;
  status: 'active' | 'inactive' | 'error';
  createdAt: string;
  updatedAt: string;
}

// 告警规则配置接口
export interface AlertRule {
  id: number;
  name: string;
  type: 'ranking_drop' | 'competitor_change' | 'keyword_opportunity' | 'traffic_anomaly';
  enabled: boolean;
  conditions: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    value: number;
    timeframe?: string;
  }[];
  actions: {
    type: 'email' | 'webhook' | 'sms';
    config: Record<string, any>;
  }[];
  lastTriggered?: string;
  triggerCount: number;
  createdAt: string;
  updatedAt: string;
}

// 系统设置接口
export interface SystemSettings {
  general: {
    siteName: string;
    timezone: string;
    language: string;
    dateFormat: string;
  };
  api: {
    rateLimit: number;
    timeout: number;
    retryAttempts: number;
  };
  data: {
    retentionDays: number;
    backupEnabled: boolean;
    backupFrequency: string;
  };
  notifications: {
    emailEnabled: boolean;
    emailFrom: string;
    webhookUrl?: string;
  };
}

// 用户偏好设置接口
export interface UserPreferences {
  dashboard: {
    defaultView: string;
    refreshInterval: number;
    chartsEnabled: boolean;
  };
  reports: {
    defaultFormat: 'pdf' | 'excel' | 'csv';
    includeCharts: boolean;
    autoGenerate: boolean;
  };
  notifications: {
    email: boolean;
    browser: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
}

// API密钥配置接口
export interface APIKeyConfig {
  id: number;
  name: string;
  service: string;
  keyValue: string;
  enabled: boolean;
  lastUsed?: string;
  usageCount: number;
  createdAt: string;
  expiresAt?: string;
}

class SettingsService {
  private baseURL = '/api/settings';

  // AI智能体配置管理
  async getAIAgents(): Promise<AIAgentConfig[]> {
    const response = await axios.get(`${this.baseURL}/ai-agents`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  async createAIAgent(agent: Omit<AIAgentConfig, 'id' | 'createdAt' | 'updatedAt' | 'lastRun' | 'nextRun' | 'status'>): Promise<AIAgentConfig> {
    const response = await axios.post(`${this.baseURL}/ai-agents`, agent, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  async updateAIAgent(id: number, agent: Partial<AIAgentConfig>): Promise<AIAgentConfig> {
    const response = await axios.put(`${this.baseURL}/ai-agents/${id}`, agent, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  async deleteAIAgent(id: number): Promise<void> {
    await axios.delete(`${this.baseURL}/ai-agents/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  async toggleAIAgent(id: number, enabled: boolean): Promise<AIAgentConfig> {
    const response = await axios.patch(`${this.baseURL}/ai-agents/${id}/toggle`, { enabled }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  async runAIAgent(id: number): Promise<void> {
    await axios.post(`${this.baseURL}/ai-agents/${id}/run`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  // 告警规则管理
  async getAlertRules(): Promise<AlertRule[]> {
    const response = await axios.get(`${this.baseURL}/alert-rules`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  async createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt' | 'lastTriggered' | 'triggerCount'>): Promise<AlertRule> {
    const response = await axios.post(`${this.baseURL}/alert-rules`, rule, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  async updateAlertRule(id: number, rule: Partial<AlertRule>): Promise<AlertRule> {
    const response = await axios.put(`${this.baseURL}/alert-rules/${id}`, rule, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  async deleteAlertRule(id: number): Promise<void> {
    await axios.delete(`${this.baseURL}/alert-rules/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  async toggleAlertRule(id: number, enabled: boolean): Promise<AlertRule> {
    const response = await axios.patch(`${this.baseURL}/alert-rules/${id}/toggle`, { enabled }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  // 系统设置管理
  async getSystemSettings(): Promise<SystemSettings> {
    const response = await axios.get(`${this.baseURL}/system`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const response = await axios.put(`${this.baseURL}/system`, settings, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  // 用户偏好设置
  async getUserPreferences(): Promise<UserPreferences> {
    const response = await axios.get(`${this.baseURL}/preferences`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await axios.put(`${this.baseURL}/preferences`, preferences, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  // API密钥管理
  async getAPIKeys(): Promise<APIKeyConfig[]> {
    const response = await axios.get(`${this.baseURL}/api-keys`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  async createAPIKey(key: Omit<APIKeyConfig, 'id' | 'createdAt' | 'lastUsed' | 'usageCount'>): Promise<APIKeyConfig> {
    const response = await axios.post(`${this.baseURL}/api-keys`, key, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  async updateAPIKey(id: number, key: Partial<APIKeyConfig>): Promise<APIKeyConfig> {
    const response = await axios.put(`${this.baseURL}/api-keys/${id}`, key, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  async deleteAPIKey(id: number): Promise<void> {
    await axios.delete(`${this.baseURL}/api-keys/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  async testAPIKey(id: number): Promise<{ success: boolean; message: string }> {
    const response = await axios.post(`${this.baseURL}/api-keys/${id}/test`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }
}

export const settingsService = new SettingsService();