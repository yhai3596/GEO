import React, { useState, useEffect } from 'react';
import { Plus, Upload, Download, Search, Filter, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import KeywordTable from '../components/keywords/KeywordTable';
import KeywordForm from '../components/keywords/KeywordForm';
import BatchImportModal from '../components/keywords/BatchImportModal';
import { 
  keywordService, 
  Keyword, 
  KeywordCreateData, 
  KeywordUpdateData,
  KeywordListParams 
} from '../services/keywordService';

const KeywordManagement: React.FC = () => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'keyword' | 'searchVolume' | 'avgRanking' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Modal states
  const [showKeywordForm, setShowKeywordForm] = useState(false);
  const [showBatchImport, setShowBatchImport] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const pageSize = 20;

  const fetchKeywords = async () => {
    try {
      setLoading(true);
      const params: KeywordListParams = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        sortBy,
        sortOrder
      };
      
      const response = await keywordService.getKeywords(params);
      setKeywords(response.keywords);
      setTotalPages(response.pagination.totalPages);
      setTotalCount(response.pagination.total);
    } catch (error) {
      console.error('获取关键词失败:', error);
      toast.error('获取关键词失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, [currentPage, searchTerm, sortBy, sortOrder]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSort = (field: typeof sortBy) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleCreateKeyword = async (data: KeywordCreateData) => {
    try {
      setFormLoading(true);
      await keywordService.createKeyword(data);
      toast.success('关键词添加成功');
      setShowKeywordForm(false);
      fetchKeywords();
    } catch (error: any) {
      console.error('添加关键词失败:', error);
      toast.error(error.response?.data?.message || '添加关键词失败');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateKeyword = async (data: KeywordUpdateData) => {
    if (!editingKeyword) return;
    
    try {
      setFormLoading(true);
      await keywordService.updateKeyword(editingKeyword.id, data);
      toast.success('关键词更新成功');
      setShowKeywordForm(false);
      setEditingKeyword(null);
      fetchKeywords();
    } catch (error: any) {
      console.error('更新关键词失败:', error);
      toast.error(error.response?.data?.message || '更新关键词失败');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    if (!confirm('确定要删除这个关键词吗？')) return;
    
    try {
      await keywordService.deleteKeyword(id);
      toast.success('关键词删除成功');
      fetchKeywords();
      setSelectedKeywords(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error: any) {
      console.error('删除关键词失败:', error);
      toast.error(error.response?.data?.message || '删除关键词失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedKeywords.size === 0) {
      toast.error('请选择要删除的关键词');
      return;
    }
    
    if (!confirm(`确定要删除选中的 ${selectedKeywords.size} 个关键词吗？`)) return;
    
    try {
      await keywordService.deleteKeywordsBatch(Array.from(selectedKeywords));
      toast.success(`成功删除 ${selectedKeywords.size} 个关键词`);
      setSelectedKeywords(new Set());
      fetchKeywords();
    } catch (error: any) {
      console.error('批量删除失败:', error);
      toast.error(error.response?.data?.message || '批量删除失败');
    }
  };

  const handleBatchImport = async (keywordData: KeywordCreateData[]) => {
    try {
      setFormLoading(true);
      const result = await keywordService.createKeywordsBatch(keywordData);
      
      if (result.errors && result.errors.length > 0) {
        toast.warning(`导入完成，但有 ${result.errors.length} 个关键词失败`);
      } else {
        toast.success(`成功导入 ${result.created.length} 个关键词`);
      }
      
      setShowBatchImport(false);
      fetchKeywords();
    } catch (error: any) {
      console.error('批量导入失败:', error);
      toast.error(error.response?.data?.message || '批量导入失败');
    } finally {
      setFormLoading(false);
    }
  };

  const handleExport = () => {
    if (keywords.length === 0) {
      toast.error('没有可导出的数据');
      return;
    }

    const headers = ['关键词', '搜索量', '难度', '平均排名', '状态', '创建时间'];
    const csvContent = [
      headers.join(','),
      ...keywords.map(keyword => [
        `"${keyword.keyword}"`,
        keyword.searchVolume || '',
        keyword.difficulty || '',
        keyword.avgRanking || '',
        keyword.status === 'active' ? '活跃' : keyword.status === 'paused' ? '暂停' : '已删除',
        new Date(keyword.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `关键词数据_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('数据导出成功');
  };

  const handleEditKeyword = (keyword: Keyword) => {
    setEditingKeyword(keyword);
    setShowKeywordForm(true);
  };

  const handleToggleStatus = async (keyword: Keyword) => {
    const newStatus = keyword.status === 'active' ? 'paused' : 'active';
    try {
      await keywordService.updateKeyword(keyword.id, { status: newStatus });
      toast.success(`关键词已${newStatus === 'active' ? '激活' : '暂停'}`);
      fetchKeywords();
    } catch (error: any) {
      console.error('更新状态失败:', error);
      toast.error(error.response?.data?.message || '更新状态失败');
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="p-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">关键词管理</h1>
          <p className="mt-1 text-sm text-gray-600">
            管理和监控您的关键词，跟踪排名变化和性能指标
          </p>
        </div>

        {/* 操作栏 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* 搜索和筛选 */}
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索关键词..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={fetchKeywords}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>刷新</span>
              </button>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center space-x-3">
              {selectedKeywords.size > 0 && (
                <button
                  onClick={handleBatchDelete}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  删除选中 ({selectedKeywords.size})
                </button>
              )}
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>导出</span>
              </button>
              <button
                onClick={() => setShowBatchImport(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>批量导入</span>
              </button>
              <button
                onClick={() => {
                  setEditingKeyword(null);
                  setShowKeywordForm(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>添加关键词</span>
              </button>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-600">总关键词</div>
            <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-600">活跃关键词</div>
            <div className="text-2xl font-bold text-green-600">
              {keywords.filter(k => k.status === 'active').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-600">暂停关键词</div>
            <div className="text-2xl font-bold text-yellow-600">
              {keywords.filter(k => k.status === 'paused').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-600">平均排名</div>
            <div className="text-2xl font-bold text-blue-600">
              {keywords.length > 0 
                ? Math.round(keywords.reduce((sum, k) => sum + (k.avgRanking || 0), 0) / keywords.length)
                : 0
              }
            </div>
          </div>
        </div>

        {/* 关键词表格 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <KeywordTable
            keywords={keywords}
            selectedKeywords={Array.from(selectedKeywords)}
            onSelectKeyword={(id) => {
              const newSet = new Set(selectedKeywords);
              if (newSet.has(id)) {
                newSet.delete(id);
              } else {
                newSet.add(id);
              }
              setSelectedKeywords(newSet);
            }}
            onSelectAll={(selected) => {
              if (selected) {
                setSelectedKeywords(new Set(keywords.map(k => k.id)));
              } else {
                setSelectedKeywords(new Set());
              }
            }}
            onEditKeyword={handleEditKeyword}
            onDeleteKeyword={(keyword) => handleDeleteKeyword(keyword.id)}
            onToggleStatus={handleToggleStatus}
            loading={loading}
          />
          
          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                显示第 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} 条，共 {totalCount} 条
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <span className="text-sm text-gray-700">
                  第 {currentPage} / {totalPages} 页
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 关键词表单模态框 */}
      <KeywordForm
        isOpen={showKeywordForm}
        onClose={() => {
          setShowKeywordForm(false);
          setEditingKeyword(null);
        }}
        onSubmit={editingKeyword ? handleUpdateKeyword : handleCreateKeyword}
        keyword={editingKeyword}
        loading={formLoading}
      />

      {/* 批量导入模态框 */}
      <BatchImportModal
        isOpen={showBatchImport}
        onClose={() => setShowBatchImport(false)}
        onImport={handleBatchImport}
        loading={formLoading}
      />
    </div>
  );
};

export default KeywordManagement;