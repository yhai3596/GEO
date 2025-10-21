import React, { useState } from 'react';
import { Bot, Play, Pause, Settings, Trash2, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AIAgentConfig } from '../../services/settingsService';

interface AIAgentCardProps {
  agent: AIAgentConfig;
  onEdit: (agent: AIAgentConfig) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number, enabled: boolean) => void;
  onRun: (id: number) => void;
}

const AIAgentCard: React.FC<AIAgentCardProps> = ({
  agent,
  onEdit,
  onDelete,
  onToggle,
  onRun
}) => {
  const [isRunning, setIsRunning] = useState(false);

  const getAgentTypeLabel = (type: string) => {
    const labels = {
      keyword_analysis: '关键词分析',
      competitor_monitoring: '竞争对手监控',
      content_optimization: '内容优化',
      ranking_prediction: '排名预测'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    try {
      await onRun(agent.id);
      toast.success('智能体运行成功');
    } catch (error) {
      toast.error('智能体运行失败');
    } finally {
      setIsRunning(false);
    }
  };

  const handleToggle = async () => {
    try {
      await onToggle(agent.id, !agent.enabled);
      toast.success(agent.enabled ? '智能体已禁用' : '智能体已启用');
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const handleDelete = () => {
    if (window.confirm('确定要删除这个智能体吗？')) {
      onDelete(agent.id);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* 头部 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${agent.enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <Bot className={`h-5 w-5 ${agent.enabled ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
            <p className="text-sm text-gray-600">{getAgentTypeLabel(agent.type)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
            {getStatusIcon(agent.status)}
            <span>{agent.status === 'active' ? '运行中' : agent.status === 'error' ? '错误' : '未激活'}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(agent)}
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

      {/* 配置信息 */}
      <div className="space-y-3 mb-4">
        {agent.config.model && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">模型:</span>
            <span className="text-gray-900">{agent.config.model}</span>
          </div>
        )}
        
        {agent.config.schedule && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">调度:</span>
            <span className="text-gray-900">{agent.config.schedule}</span>
          </div>
        )}
        
        {agent.lastRun && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">上次运行:</span>
            <span className="text-gray-900">{new Date(agent.lastRun).toLocaleString()}</span>
          </div>
        )}
        
        {agent.nextRun && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">下次运行:</span>
            <span className="text-gray-900">{new Date(agent.nextRun).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggle}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              agent.enabled
                ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                : 'text-green-600 bg-green-50 hover:bg-green-100'
            }`}
          >
            {agent.enabled ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            <span>{agent.enabled ? '禁用' : '启用'}</span>
          </button>
        </div>
        
        <button
          onClick={handleRun}
          disabled={!agent.enabled || isRunning}
          className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className={`h-3 w-3 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? '运行中...' : '立即运行'}</span>
        </button>
      </div>
    </div>
  );
};

export default AIAgentCard;