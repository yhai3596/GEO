#!/usr/bin/env node

/**
 * 自动化GEO智能评估平台 - 部署验证脚本
 * 用于验证部署后的应用程序是否正常工作
 */

import https from 'https';
import http from 'http';

// 颜色输出函数
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// HTTP 请求函数
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: 10000,
      ...options
    };
    
    const req = client.get(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// 验证健康检查端点
async function verifyHealthCheck(baseUrl) {
  logStep('1', '验证健康检查端点');
  
  try {
    const response = await makeRequest(`${baseUrl}/api/health`);
    
    if (response.statusCode === 200) {
      const healthData = JSON.parse(response.body);
      
      logSuccess('健康检查端点响应正常');
      log(`状态: ${healthData.message}`, 'blue');
      log(`环境: ${healthData.environment}`, 'blue');
      
      if (healthData.services) {
        log('服务状态:', 'blue');
        Object.entries(healthData.services).forEach(([service, status]) => {
          if (status === 'healthy') {
            logSuccess(`  ${service}: ${status}`);
          } else {
            logWarning(`  ${service}: ${status}`);
          }
        });
      }
      
      return true;
    } else {
      logError(`健康检查失败，状态码: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    logError(`健康检查请求失败: ${error.message}`);
    return false;
  }
}

// 验证前端页面
async function verifyFrontend(baseUrl) {
  logStep('2', '验证前端页面');
  
  try {
    const response = await makeRequest(baseUrl);
    
    if (response.statusCode === 200) {
      const htmlContent = response.body;
      
      // 检查关键元素
      const checks = [
        { name: 'HTML文档', pattern: /<html/i },
        { name: 'React应用', pattern: /<div id="root"/i },
        { name: '标题元素', pattern: /<title>/i },
        { name: 'Vite脚本', pattern: /vite|@vite/i }
      ];
      
      let passedChecks = 0;
      
      checks.forEach(check => {
        if (check.pattern.test(htmlContent)) {
          logSuccess(`  ${check.name} 检查通过`);
          passedChecks++;
        } else {
          logWarning(`  ${check.name} 检查失败`);
        }
      });
      
      if (passedChecks >= 3) {
        logSuccess('前端页面验证通过');
        return true;
      } else {
        logWarning('前端页面验证部分通过');
        return false;
      }
    } else {
      logError(`前端页面访问失败，状态码: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    logError(`前端页面请求失败: ${error.message}`);
    return false;
  }
}

// 验证API端点
async function verifyApiEndpoints(baseUrl) {
  logStep('3', '验证API端点');
  
  const endpoints = [
    { path: '/api/health', name: '健康检查' },
    { path: '/api/auth/login', name: '登录接口', method: 'POST', expectError: true },
    { path: '/api/keywords', name: '关键词接口', expectAuth: true },
    { path: '/api/geo-results', name: 'GEO结果接口', expectAuth: true }
  ];
  
  let passedTests = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${baseUrl}${endpoint.path}`);
      
      if (endpoint.expectError && response.statusCode >= 400) {
        logSuccess(`  ${endpoint.name}: 正确返回错误状态 (${response.statusCode})`);
        passedTests++;
      } else if (endpoint.expectAuth && response.statusCode === 401) {
        logSuccess(`  ${endpoint.name}: 正确要求认证 (401)`);
        passedTests++;
      } else if (response.statusCode === 200) {
        logSuccess(`  ${endpoint.name}: 响应正常 (200)`);
        passedTests++;
      } else {
        logWarning(`  ${endpoint.name}: 状态码 ${response.statusCode}`);
      }
    } catch (error) {
      logWarning(`  ${endpoint.name}: 请求失败 - ${error.message}`);
    }
  }
  
  if (passedTests >= endpoints.length * 0.75) {
    logSuccess('API端点验证通过');
    return true;
  } else {
    logWarning('API端点验证部分通过');
    return false;
  }
}

// 验证数据库连接
async function verifyDatabase(baseUrl) {
  logStep('4', '验证数据库连接');
  
  try {
    const response = await makeRequest(`${baseUrl}/api/health`);
    
    if (response.statusCode === 200) {
      const healthData = JSON.parse(response.body);
      
      if (healthData.services && healthData.services.database === 'healthy') {
        logSuccess('数据库连接正常');
        return true;
      } else {
        logError('数据库连接异常');
        return false;
      }
    } else {
      logError('无法获取数据库状态');
      return false;
    }
  } catch (error) {
    logError(`数据库验证失败: ${error.message}`);
    return false;
  }
}

// 性能测试
async function performanceTest(baseUrl) {
  logStep('5', '性能测试');
  
  const tests = [
    { name: '首页加载', path: '/' },
    { name: '健康检查', path: '/api/health' }
  ];
  
  for (const test of tests) {
    try {
      const startTime = Date.now();
      const response = await makeRequest(`${baseUrl}${test.path}`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.statusCode === 200) {
        if (responseTime < 1000) {
          logSuccess(`  ${test.name}: ${responseTime}ms (优秀)`);
        } else if (responseTime < 3000) {
          logWarning(`  ${test.name}: ${responseTime}ms (一般)`);
        } else {
          logError(`  ${test.name}: ${responseTime}ms (较慢)`);
        }
      } else {
        logWarning(`  ${test.name}: 状态码 ${response.statusCode}`);
      }
    } catch (error) {
      logError(`  ${test.name}: 测试失败 - ${error.message}`);
    }
  }
}

// 生成验证报告
function generateReport(results) {
  logStep('6', '生成验证报告');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(result => result).length;
  const successRate = (passedTests / totalTests * 100).toFixed(1);
  
  log('\n📊 验证结果汇总:', 'bright');
  log(`总测试项: ${totalTests}`);
  log(`通过测试: ${passedTests}`);
  log(`成功率: ${successRate}%`);
  
  if (successRate >= 80) {
    logSuccess('\n🎉 部署验证通过！应用程序运行正常');
  } else if (successRate >= 60) {
    logWarning('\n⚠️  部署验证部分通过，建议检查失败项目');
  } else {
    logError('\n❌ 部署验证失败，需要修复问题');
  }
  
  log('\n📋 测试详情:', 'bright');
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ 通过' : '❌ 失败';
    log(`  ${test}: ${status}`);
  });
  
  log('\n🔗 有用的链接:', 'bright');
  log('- 应用程序: ' + (process.argv[2] || 'http://localhost:5173'));
  log('- 健康检查: ' + (process.argv[2] || 'http://localhost:3001') + '/api/health');
  log('- 部署文档: ./DEPLOYMENT.md');
}

// 主函数
async function main() {
  const baseUrl = process.argv[2] || 'http://localhost:3001';
  const frontendUrl = process.argv[3] || 'http://localhost:5173';
  
  log('🔍 开始验证自动化GEO智能评估平台部署', 'bright');
  log('=' * 60, 'cyan');
  log(`API地址: ${baseUrl}`, 'blue');
  log(`前端地址: ${frontendUrl}`, 'blue');
  
  const results = {};
  
  try {
    results['健康检查'] = await verifyHealthCheck(baseUrl);
    results['前端页面'] = await verifyFrontend(frontendUrl);
    results['API端点'] = await verifyApiEndpoints(baseUrl);
    results['数据库连接'] = await verifyDatabase(baseUrl);
    
    await performanceTest(baseUrl);
    
    generateReport(results);
    
  } catch (error) {
    logError(`验证过程中发生错误: ${error.message}`);
    process.exit(1);
  }
}

// 处理命令行参数
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log('自动化GEO智能评估平台 - 部署验证脚本', 'bright');
  log('\n用法:');
  log('  node scripts/verify-deployment.js [API_URL] [FRONTEND_URL]');
  log('\n参数:');
  log('  API_URL        API服务器地址 (默认: http://localhost:3001)');
  log('  FRONTEND_URL   前端服务器地址 (默认: http://localhost:5173)');
  log('\n选项:');
  log('  --help, -h     显示帮助信息');
  log('\n示例:');
  log('  node scripts/verify-deployment.js');
  log('  node scripts/verify-deployment.js http://localhost:3001 http://localhost:5173');
  log('  node scripts/verify-deployment.js https://your-app.vercel.app https://your-app.vercel.app');
  process.exit(0);
}

// 执行主函数
main();