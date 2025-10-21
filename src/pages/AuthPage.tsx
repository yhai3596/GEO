import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuthStore } from '../stores/authStore';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  // 如果已经登录，重定向到仪表盘
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // 根据URL参数设置初始状态
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setIsLogin(false);
    }
  }, [location]);

  const handleAuthSuccess = () => {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  };

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    // 更新URL参数
    const searchParams = new URLSearchParams();
    if (!isLogin) {
      searchParams.set('mode', 'login');
    } else {
      searchParams.set('mode', 'register');
    }
    navigate(`/auth?${searchParams.toString()}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* 左侧：品牌介绍 */}
        <div className="hidden lg:block">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              GEO智能评估平台
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              基于AI技术的搜索引擎优化评估平台，帮助您实时监控品牌在搜索结果中的表现，
              提供智能化的竞争对手分析和数据洞察。
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">实时监控</h3>
                  <p className="text-gray-600">24/7监控您的品牌在搜索结果中的表现</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">智能分析</h3>
                  <p className="text-gray-600">AI驱动的数据分析和竞争对手洞察</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">自动告警</h3>
                  <p className="text-gray-600">关键指标变化时及时通知您</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：认证表单 */}
        <div className="w-full">
          {isLogin ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={handleSwitchMode}
            />
          ) : (
            <RegisterForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={handleSwitchMode}
            />
          )}
        </div>
      </div>

      {/* 移动端品牌信息 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            GEO智能评估平台
          </h2>
          <p className="text-sm text-gray-600">
            AI驱动的搜索引擎优化评估解决方案
          </p>
        </div>
      </div>
    </div>
  );
};