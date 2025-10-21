import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthPage } from "./pages/AuthPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import KeywordManagement from "@/pages/KeywordManagement";
import DataAnalysis from "@/pages/DataAnalysis";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Router>
      <Routes>
        {/* 公开路由 */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* 受保护的路由 */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* 其他受保护的路由 */}
        <Route 
          path="/keywords" 
          element={
            <ProtectedRoute>
              <Layout>
                <KeywordManagement />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <Layout>
                <DataAnalysis />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* 管理员路由 */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole={['admin']}>
              <Layout>
                <div className="min-h-full bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">管理员面板</h2>
                    <p className="text-gray-600">功能开发中...</p>
                  </div>
                </div>
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* 404和重定向 */}
        <Route path="/other" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </>
  );
}
