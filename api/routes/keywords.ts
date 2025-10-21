import { Router } from 'express';
import { DatabaseService } from '../services/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const dbService = new DatabaseService();

// 获取用户的所有关键词
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 20, search = '', sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    let whereClause = 'WHERE user_id = $1';
    let queryParams: any[] = [userId];
    
    if (search) {
      whereClause += ' AND keyword ILIKE $2';
      queryParams.push(`%${search}%`);
    }
    
    const orderClause = `ORDER BY ${sortBy} ${sortOrder.toString().toUpperCase()}`;
    
    // 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM keywords ${whereClause}`;
    const countResult = await dbService.pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    
    // 获取关键词列表
    const query = `
      SELECT 
        k.*,
        COUNT(gr.id) as geo_results_count,
        AVG(gr.ranking) as avg_ranking,
        MAX(gr.created_at) as last_geo_check
      FROM keywords k
      LEFT JOIN geo_results gr ON k.id = gr.keyword_id
      ${whereClause}
      GROUP BY k.id
      ${orderClause}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    
    queryParams.push(Number(limit), offset);
    const result = await dbService.pool.query(query, queryParams);
    
    const keywords = result.rows.map(row => ({
      id: row.id,
      keyword: row.keyword,
      searchVolume: row.search_volume,
      difficulty: row.difficulty,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      geoResultsCount: parseInt(row.geo_results_count) || 0,
      avgRanking: row.avg_ranking ? parseFloat(row.avg_ranking) : null,
      lastGeoCheck: row.last_geo_check
    }));
    
    res.json({
      success: true,
      data: {
        keywords,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取关键词列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取关键词列表失败'
    });
  }
});

// 创建新关键词
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { keyword, searchVolume, difficulty } = req.body;
    
    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: '关键词不能为空'
      });
    }
    
    // 检查关键词是否已存在
    const existingKeyword = await dbService.pool.query(
      'SELECT id FROM keywords WHERE user_id = $1 AND keyword = $2',
      [userId, keyword]
    );
    
    if (existingKeyword.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: '关键词已存在'
      });
    }
    
    const result = await dbService.pool.query(
      `INSERT INTO keywords (user_id, keyword, search_volume, difficulty, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING *`,
      [userId, keyword, searchVolume || null, difficulty || null]
    );
    
    const newKeyword = result.rows[0];
    
    res.status(201).json({
      success: true,
      data: {
        id: newKeyword.id,
        keyword: newKeyword.keyword,
        searchVolume: newKeyword.search_volume,
        difficulty: newKeyword.difficulty,
        status: newKeyword.status,
        createdAt: newKeyword.created_at,
        updatedAt: newKeyword.updated_at
      }
    });
  } catch (error) {
    console.error('创建关键词失败:', error);
    res.status(500).json({
      success: false,
      message: '创建关键词失败'
    });
  }
});

// 批量创建关键词
router.post('/batch', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { keywords } = req.body;
    
    if (!Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({
        success: false,
        message: '关键词列表不能为空'
      });
    }
    
    const client = await dbService.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const createdKeywords = [];
      const errors = [];
      
      for (const keywordData of keywords) {
        try {
          const { keyword, searchVolume, difficulty } = keywordData;
          
          if (!keyword) {
            errors.push({ keyword: keyword || '未知', error: '关键词不能为空' });
            continue;
          }
          
          // 检查关键词是否已存在
          const existingKeyword = await client.query(
            'SELECT id FROM keywords WHERE user_id = $1 AND keyword = $2',
            [userId, keyword]
          );
          
          if (existingKeyword.rows.length > 0) {
            errors.push({ keyword, error: '关键词已存在' });
            continue;
          }
          
          const result = await client.query(
            `INSERT INTO keywords (user_id, keyword, search_volume, difficulty, status)
             VALUES ($1, $2, $3, $4, 'active')
             RETURNING *`,
            [userId, keyword, searchVolume || null, difficulty || null]
          );
          
          const newKeyword = result.rows[0];
          createdKeywords.push({
            id: newKeyword.id,
            keyword: newKeyword.keyword,
            searchVolume: newKeyword.search_volume,
            difficulty: newKeyword.difficulty,
            status: newKeyword.status,
            createdAt: newKeyword.created_at,
            updatedAt: newKeyword.updated_at
          });
        } catch (error) {
          errors.push({ keyword: keywordData.keyword || '未知', error: '创建失败' });
        }
      }
      
      await client.query('COMMIT');
      
      res.status(201).json({
        success: true,
        data: {
          created: createdKeywords,
          errors: errors,
          summary: {
            total: keywords.length,
            created: createdKeywords.length,
            failed: errors.length
          }
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('批量创建关键词失败:', error);
    res.status(500).json({
      success: false,
      message: '批量创建关键词失败'
    });
  }
});

// 更新关键词
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const keywordId = req.params.id;
    const { keyword, searchVolume, difficulty, status } = req.body;
    
    // 检查关键词是否属于当前用户
    const existingKeyword = await dbService.pool.query(
      'SELECT id FROM keywords WHERE id = $1 AND user_id = $2',
      [keywordId, userId]
    );
    
    if (existingKeyword.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '关键词不存在'
      });
    }
    
    // 如果更新关键词名称，检查是否与其他关键词重复
    if (keyword) {
      const duplicateKeyword = await dbService.pool.query(
        'SELECT id FROM keywords WHERE user_id = $1 AND keyword = $2 AND id != $3',
        [userId, keyword, keywordId]
      );
      
      if (duplicateKeyword.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: '关键词已存在'
        });
      }
    }
    
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;
    
    if (keyword !== undefined) {
      updateFields.push(`keyword = $${paramIndex++}`);
      updateValues.push(keyword);
    }
    if (searchVolume !== undefined) {
      updateFields.push(`search_volume = $${paramIndex++}`);
      updateValues.push(searchVolume);
    }
    if (difficulty !== undefined) {
      updateFields.push(`difficulty = $${paramIndex++}`);
      updateValues.push(difficulty);
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(status);
    }
    
    updateFields.push(`updated_at = NOW()`);
    updateValues.push(keywordId, userId);
    
    const query = `
      UPDATE keywords 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
      RETURNING *
    `;
    
    const result = await dbService.pool.query(query, updateValues);
    const updatedKeyword = result.rows[0];
    
    res.json({
      success: true,
      data: {
        id: updatedKeyword.id,
        keyword: updatedKeyword.keyword,
        searchVolume: updatedKeyword.search_volume,
        difficulty: updatedKeyword.difficulty,
        status: updatedKeyword.status,
        createdAt: updatedKeyword.created_at,
        updatedAt: updatedKeyword.updated_at
      }
    });
  } catch (error) {
    console.error('更新关键词失败:', error);
    res.status(500).json({
      success: false,
      message: '更新关键词失败'
    });
  }
});

// 删除关键词
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const keywordId = req.params.id;
    
    // 检查关键词是否属于当前用户
    const existingKeyword = await dbService.pool.query(
      'SELECT id FROM keywords WHERE id = $1 AND user_id = $2',
      [keywordId, userId]
    );
    
    if (existingKeyword.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '关键词不存在'
      });
    }
    
    // 删除关键词（级联删除相关的GEO结果）
    await dbService.pool.query(
      'DELETE FROM keywords WHERE id = $1 AND user_id = $2',
      [keywordId, userId]
    );
    
    res.json({
      success: true,
      message: '关键词删除成功'
    });
  } catch (error) {
    console.error('删除关键词失败:', error);
    res.status(500).json({
      success: false,
      message: '删除关键词失败'
    });
  }
});

// 批量删除关键词
router.delete('/batch', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { keywordIds } = req.body;
    
    if (!Array.isArray(keywordIds) || keywordIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '关键词ID列表不能为空'
      });
    }
    
    // 检查所有关键词是否属于当前用户
    const placeholders = keywordIds.map((_, index) => `$${index + 2}`).join(',');
    const checkQuery = `
      SELECT id FROM keywords 
      WHERE user_id = $1 AND id IN (${placeholders})
    `;
    
    const checkResult = await dbService.pool.query(checkQuery, [userId, ...keywordIds]);
    const validKeywordIds = checkResult.rows.map(row => row.id);
    
    if (validKeywordIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: '没有找到有效的关键词'
      });
    }
    
    // 删除关键词
    const deletePlaceholders = validKeywordIds.map((_, index) => `$${index + 2}`).join(',');
    const deleteQuery = `
      DELETE FROM keywords 
      WHERE user_id = $1 AND id IN (${deletePlaceholders})
    `;
    
    await dbService.pool.query(deleteQuery, [userId, ...validKeywordIds]);
    
    res.json({
      success: true,
      data: {
        deletedCount: validKeywordIds.length,
        deletedIds: validKeywordIds
      },
      message: `成功删除 ${validKeywordIds.length} 个关键词`
    });
  } catch (error) {
    console.error('批量删除关键词失败:', error);
    res.status(500).json({
      success: false,
      message: '批量删除关键词失败'
    });
  }
});

export default router;