import { ApiResponse } from '../../shared/types/database';

const API_BASE_URL = 'http://localhost:3002/api';

export interface Keyword {
  id: string;
  keyword: string;
  searchVolume: number | null;
  difficulty: number | null;
  status: 'active' | 'paused' | 'deleted';
  createdAt: string;
  updatedAt: string;
  geoResultsCount?: number;
  avgRanking?: number | null;
  lastGeoCheck?: string;
}

export interface KeywordCreateData {
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
}

export interface KeywordUpdateData {
  keyword?: string;
  searchVolume?: number;
  difficulty?: number;
  status?: 'active' | 'paused' | 'deleted';
}

export interface KeywordListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface KeywordListResponse {
  keywords: Keyword[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BatchCreateResponse {
  created: Keyword[];
  errors: Array<{ keyword: string; error: string }>;
  summary: {
    total: number;
    created: number;
    failed: number;
  };
}

export interface BatchDeleteResponse {
  deletedCount: number;
  deletedIds: string[];
}

class KeywordService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth-token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getKeywords(params: KeywordListParams = {}): Promise<KeywordListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${API_BASE_URL}/keywords?${searchParams}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('获取关键词列表失败');
    }

    const result: ApiResponse<KeywordListResponse> = await response.json();
    if (!result.success) {
      throw new Error(result.message || '获取关键词列表失败');
    }

    return result.data!;
  }

  async createKeyword(data: KeywordCreateData): Promise<Keyword> {
    const response = await fetch(`${API_BASE_URL}/keywords`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '创建关键词失败');
    }

    const result: ApiResponse<Keyword> = await response.json();
    if (!result.success) {
      throw new Error(result.message || '创建关键词失败');
    }

    return result.data!;
  }

  async createKeywordsBatch(keywords: KeywordCreateData[]): Promise<BatchCreateResponse> {
    const response = await fetch(`${API_BASE_URL}/keywords/batch`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ keywords })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '批量创建关键词失败');
    }

    const result: ApiResponse<BatchCreateResponse> = await response.json();
    if (!result.success) {
      throw new Error(result.message || '批量创建关键词失败');
    }

    return result.data!;
  }

  async updateKeyword(id: string, data: KeywordUpdateData): Promise<Keyword> {
    const response = await fetch(`${API_BASE_URL}/keywords/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '更新关键词失败');
    }

    const result: ApiResponse<Keyword> = await response.json();
    if (!result.success) {
      throw new Error(result.message || '更新关键词失败');
    }

    return result.data!;
  }

  async deleteKeyword(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/keywords/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '删除关键词失败');
    }

    const result: ApiResponse<void> = await response.json();
    if (!result.success) {
      throw new Error(result.message || '删除关键词失败');
    }
  }

  async deleteKeywordsBatch(keywordIds: string[]): Promise<BatchDeleteResponse> {
    const response = await fetch(`${API_BASE_URL}/keywords/batch`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ keywordIds })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '批量删除关键词失败');
    }

    const result: ApiResponse<BatchDeleteResponse> = await response.json();
    if (!result.success) {
      throw new Error(result.message || '批量删除关键词失败');
    }

    return result.data!;
  }
}

export const keywordService = new KeywordService();