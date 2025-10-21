import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Keyword, KeywordCreateData, KeywordUpdateData } from '../../services/keywordService';

interface KeywordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: KeywordCreateData | KeywordUpdateData) => Promise<void>;
  keyword?: Keyword | null;
  loading?: boolean;
}

const KeywordForm: React.FC<KeywordFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  keyword = null,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    keyword: '',
    searchVolume: '',
    difficulty: '',
    status: 'active' as 'active' | 'paused'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (keyword) {
      setFormData({
        keyword: keyword.keyword,
        searchVolume: keyword.searchVolume?.toString() || '',
        difficulty: keyword.difficulty?.toString() || '',
        status: keyword.status === 'deleted' ? 'paused' : keyword.status
      });
    } else {
      setFormData({
        keyword: '',
        searchVolume: '',
        difficulty: '',
        status: 'active'
      });
    }
    setErrors({});
  }, [keyword, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.keyword.trim()) {
      newErrors.keyword = '关键词不能为空';
    }

    if (formData.searchVolume && isNaN(Number(formData.searchVolume))) {
      newErrors.searchVolume = '搜索量必须是数字';
    }

    if (formData.difficulty) {
      const difficultyNum = Number(formData.difficulty);
      if (isNaN(difficultyNum) || difficultyNum < 0 || difficultyNum > 100) {
        newErrors.difficulty = '难度必须是0-100之间的数字';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData: any = {
        keyword: formData.keyword.trim(),
        searchVolume: formData.searchVolume ? Number(formData.searchVolume) : undefined,
        difficulty: formData.difficulty ? Number(formData.difficulty) : undefined
      };

      if (keyword) {
        submitData.status = formData.status;
      }

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('提交表单失败:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {keyword ? '编辑关键词' : '添加关键词'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
              关键词 *
            </label>
            <input
              type="text"
              id="keyword"
              value={formData.keyword}
              onChange={(e) => handleChange('keyword', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.keyword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="输入关键词"
              disabled={loading}
            />
            {errors.keyword && (
              <p className="mt-1 text-sm text-red-600">{errors.keyword}</p>
            )}
          </div>

          <div>
            <label htmlFor="searchVolume" className="block text-sm font-medium text-gray-700 mb-1">
              搜索量
            </label>
            <input
              type="number"
              id="searchVolume"
              value={formData.searchVolume}
              onChange={(e) => handleChange('searchVolume', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.searchVolume ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="月搜索量"
              min="0"
              disabled={loading}
            />
            {errors.searchVolume && (
              <p className="mt-1 text-sm text-red-600">{errors.searchVolume}</p>
            )}
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
              难度 (%)
            </label>
            <input
              type="number"
              id="difficulty"
              value={formData.difficulty}
              onChange={(e) => handleChange('difficulty', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.difficulty ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="SEO难度 (0-100)"
              min="0"
              max="100"
              disabled={loading}
            />
            {errors.difficulty && (
              <p className="mt-1 text-sm text-red-600">{errors.difficulty}</p>
            )}
          </div>

          {keyword && (
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                状态
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="active">活跃</option>
                <option value="paused">暂停</option>
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? '保存中...' : (keyword ? '更新' : '添加')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KeywordForm;