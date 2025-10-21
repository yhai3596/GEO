import { DatabaseService } from './database.js';
import { hashPassword, comparePassword, validatePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { User } from '../../shared/types/database.js';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'geo_analyst' | 'business_user';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: Omit<User, 'password_hash'>;
    token: string;
  };
  errors?: string[];
}

export class AuthService {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = new DatabaseService();
  }

  async register(registerData: RegisterData): Promise<AuthResponse> {
    try {
      const { name, email, password, role = 'business_user' } = registerData;

      // 验证密码强度
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: '密码不符合要求',
          errors: passwordValidation.errors
        };
      }

      // 检查用户是否已存在
      const existingUser = await this.dbService.getUserByEmail(email);
      if (existingUser) {
        return {
          success: false,
          message: '该邮箱已被注册'
        };
      }

      // 加密密码
      const hashedPassword = await hashPassword(password);

      // 创建用户
      const newUser = await this.dbService.createUser({
        name,
        email,
        password_hash: hashedPassword,
        role
      });

      // 生成JWT令牌
      const token = generateToken(newUser);

      // 返回用户信息（不包含密码）
      const { password_hash: _, ...userWithoutPassword } = newUser;

      return {
        success: true,
        message: '注册成功',
        data: {
          user: userWithoutPassword,
          token
        }
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: '注册失败，请稍后重试'
      };
    }
  }

  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const { email, password } = loginData;

      // 查找用户
      const user = await this.dbService.getUserByEmail(email);
      if (!user) {
        return {
          success: false,
          message: '邮箱或密码错误'
        };
      }

      // 检查用户状态
      if (user.status !== 'active') {
        return {
          success: false,
          message: '账户已被禁用，请联系管理员'
        };
      }

      // 验证密码
      const isPasswordValid = await comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        return {
          success: false,
          message: '邮箱或密码错误'
        };
      }

      // 更新最后登录时间
      await this.dbService.updateUserLastLogin(user.id);

      // 生成JWT令牌
      const token = generateToken(user);

      // 返回用户信息（不包含密码）
      const { password_hash: _, ...userWithoutPassword } = user;

      return {
        success: true,
        message: '登录成功',
        data: {
          user: userWithoutPassword,
          token
        }
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: '登录失败，请稍后重试'
      };
    }
  }

  async getUserProfile(userId: string): Promise<AuthResponse> {
    try {
      const user = await this.dbService.getUserById(userId);
      if (!user) {
        return {
          success: false,
          message: '用户不存在'
        };
      }

      // 返回用户信息（不包含密码）
      const { password_hash: _, ...userWithoutPassword } = user;

      return {
        success: true,
        message: '获取用户信息成功',
        data: {
          user: userWithoutPassword,
          token: '' // 不需要返回新token
        }
      };

    } catch (error) {
      console.error('Get user profile error:', error);
      return {
        success: false,
        message: '获取用户信息失败'
      };
    }
  }

  async updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      // 获取用户信息
      const user = await this.dbService.getUserById(userId);
      if (!user) {
        return {
          success: false,
          message: '用户不存在'
        };
      }

      // 验证旧密码
      const isOldPasswordValid = await comparePassword(oldPassword, user.password_hash);
      if (!isOldPasswordValid) {
        return {
          success: false,
          message: '原密码错误'
        };
      }

      // 验证新密码强度
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: '新密码不符合要求',
          errors: passwordValidation.errors
        };
      }

      // 加密新密码
      const hashedNewPassword = await hashPassword(newPassword);

      // 更新密码
      await this.dbService.updateUserPassword(userId, hashedNewPassword);

      return {
        success: true,
        message: '密码更新成功'
      };

    } catch (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        message: '密码更新失败'
      };
    }
  }
}