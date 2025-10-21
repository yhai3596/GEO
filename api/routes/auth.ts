import express from 'express';
import { AuthService } from '../services/auth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const authService = new AuthService();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 基本验证
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '姓名、邮箱和密码不能为空'
      });
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '邮箱格式不正确'
      });
    }

    const result = await authService.register({
      name,
      email,
      password,
      role: role || 'business_user'
    });

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Register route error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 基本验证
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '邮箱和密码不能为空'
      });
    }

    const result = await authService.login({ email, password });

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取用户信息（需要认证）
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    const result = await authService.getUserProfile(req.user.userId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Profile route error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 更新密码（需要认证）
router.put('/password', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '原密码和新密码不能为空'
      });
    }

    const result = await authService.updatePassword(
      req.user.userId,
      oldPassword,
      newPassword
    );

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Update password route error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 验证令牌（需要认证）
router.get('/verify', authenticateToken, (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '令牌无效'
      });
    }

    res.status(200).json({
      success: true,
      message: '令牌有效',
      data: {
        user: {
          id: req.user.userId,
          email: req.user.email,
          role: req.user.role
        }
      }
    });
  } catch (error) {
    console.error('Verify token route error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 登出（客户端处理，清除token）
router.post('/logout', authenticateToken, (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    console.error('Logout route error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

export default router;