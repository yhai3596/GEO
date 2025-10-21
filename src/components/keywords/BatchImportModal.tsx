import React, { useState } from 'react';
import { X, Upload, Download, AlertCircle } from 'lucide-react';
import { KeywordCreateData } from '../../services/keywordService';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (keywords: KeywordCreateData[]) => Promise<void>;
  loading?: boolean;
}

const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  loading = false
}) => {
  const [textInput, setTextInput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const handleTextImport = () => {
    const lines = textInput.trim().split('\n').filter(line => line.trim());
    const keywords: KeywordCreateData[] = [];
    const newErrors: string[] = [];

    lines.forEach((line, index) => {
      const parts = line.split('\t').map(part => part.trim());
      const keyword = parts[0];
      
      if (!keyword) {
        newErrors.push(`第 ${index + 1} 行：关键词不能为空`);
        return;
      }

      const keywordData: KeywordCreateData = { keyword };

      // 可选的搜索量
      if (parts[1] && parts[1] !== '') {
        const searchVolume = Number(parts[1]);
        if (isNaN(searchVolume) || searchVolume < 0) {
          newErrors.push(`第 ${index + 1} 行：搜索量必须是非负数字`);
          return;
        }
        keywordData.searchVolume = searchVolume;
      }

      // 可选的难度
      if (parts[2] && parts[2] !== '') {
        const difficulty = Number(parts[2]);
        if (isNaN(difficulty) || difficulty < 0 || difficulty > 100) {
          newErrors.push(`第 ${index + 1} 行：难度必须是0-100之间的数字`);
          return;
        }
        keywordData.difficulty = difficulty;
      }

      keywords.push(keywordData);
    });

    setErrors(newErrors);

    if (newErrors.length === 0 && keywords.length > 0) {
      onImport(keywords);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setTextInput(content);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = `关键词\t搜索量\t难度
SEO优化\t1200\t65
网站建设\t800\t45
数字营销\t950\t55`;
    
    const blob = new Blob([template], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '关键词导入模板.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setTextInput('');
    setErrors([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">批量导入关键词</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* 说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">导入说明</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 每行一个关键词，使用制表符(Tab)分隔字段</li>
                <li>• 格式：关键词[Tab]搜索量[Tab]难度</li>
                <li>• 搜索量和难度为可选字段</li>
                <li>• 难度范围：0-100</li>
              </ul>
            </div>

            {/* 模板下载 */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">导入模板</span>
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>下载模板</span>
              </button>
            </div>

            {/* 文件上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                从文件导入
              </label>
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <Upload className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">选择文件</span>
                  <input
                    type="file"
                    accept=".txt,.csv"
                    onChange={handleFileImport}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
                <span className="text-sm text-gray-500">支持 .txt, .csv 文件</span>
              </div>
            </div>

            {/* 文本输入 */}
            <div>
              <label htmlFor="textInput" className="block text-sm font-medium text-gray-700 mb-2">
                或直接粘贴内容
              </label>
              <textarea
                id="textInput"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="关键词	搜索量	难度&#10;SEO优化	1200	65&#10;网站建设	800	45"
                disabled={loading}
              />
            </div>

            {/* 错误信息 */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <h4 className="text-sm font-medium text-red-900">导入错误</h4>
                </div>
                <ul className="text-sm text-red-800 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <button
            onClick={reset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            清空
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              取消
            </button>
            <button
              onClick={handleTextImport}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !textInput.trim()}
            >
              {loading ? '导入中...' : '导入'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchImportModal;