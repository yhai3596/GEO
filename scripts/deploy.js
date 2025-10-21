#!/usr/bin/env node

/**
 * 自动化GEO智能评估平台 - 部署脚本
 * 用于自动化部署流程，包括构建、环境检查和数据库初始化
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 颜色输出函数
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
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

// 执行命令函数
function runCommand(command, description) {
  try {
    log(`执行: ${command}`, 'blue');
    execSync(command, { stdio: 'inherit' });
    logSuccess(`${description} 完成`);
  } catch (error) {
    logError(`${description} 失败: ${error.message}`);
    process.exit(1);
  }
}

// 检查文件是否存在
function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    logSuccess(`${description} 存在`);
    return true;
  } else {
    logWarning(`${description} 不存在: ${filePath}`);
    return false;
  }
}

// 检查环境变量
function checkEnvironmentVariables() {
  logStep('1', '检查环境变量配置');
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'JWT_SECRET'
  ];

  const envFile = path.join(process.cwd(), '.env');
  
  if (!checkFileExists(envFile, '.env 文件')) {
    logError('请先创建 .env 文件并配置必要的环境变量');
    logError('参考 .env.example 文件进行配置');
    process.exit(1);
  }

  // 读取 .env 文件
  const envContent = fs.readFileSync(envFile, 'utf8');
  const missingVars = [];

  requiredEnvVars.forEach(varName => {
    if (!envContent.includes(`${varName}=`) || envContent.includes(`${varName}=your_`)) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    logError('以下环境变量未正确配置:');
    missingVars.forEach(varName => {
      logError(`  - ${varName}`);
    });
    process.exit(1);
  }

  logSuccess('环境变量配置检查通过');
}

// 检查依赖
function checkDependencies() {
  logStep('2', '检查项目依赖');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!checkFileExists(packageJsonPath, 'package.json')) {
    logError('package.json 文件不存在');
    process.exit(1);
  }

  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    logWarning('node_modules 不存在，正在安装依赖...');
    runCommand('npm install', '依赖安装');
  } else {
    logSuccess('依赖已安装');
  }
}

// 构建项目
function buildProject() {
  logStep('3', '构建项目');
  
  // 检查是否有构建脚本
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.build) {
    runCommand('npm run build', '前端构建');
  } else {
    logWarning('未找到构建脚本，跳过前端构建');
  }

  if (packageJson.scripts && packageJson.scripts['server:build']) {
    runCommand('npm run server:build', '后端构建');
  } else {
    logWarning('未找到后端构建脚本，跳过后端构建');
  }
}

// 数据库健康检查
function checkDatabaseConnection() {
  logStep('4', '检查数据库连接');
  
  try {
    // 尝试连接数据库
    runCommand('node -e "require(\'./api/config/database.js\').checkDatabaseHealth().then(console.log).catch(console.error)"', '数据库连接测试');
  } catch (error) {
    logError('数据库连接失败，请检查 DATABASE_URL 配置');
    process.exit(1);
  }
}

// 运行测试
function runTests() {
  logStep('5', '运行测试');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.test) {
    try {
      runCommand('npm test', '测试执行');
    } catch (error) {
      logWarning('测试失败，但继续部署流程');
    }
  } else {
    logWarning('未找到测试脚本，跳过测试');
  }
}

// 部署到 Vercel
function deployToVercel() {
  logStep('6', '部署到 Vercel');
  
  try {
    // 检查是否安装了 Vercel CLI
    execSync('vercel --version', { stdio: 'pipe' });
  } catch (error) {
    logWarning('Vercel CLI 未安装，正在安装...');
    runCommand('npm install -g vercel', 'Vercel CLI 安装');
  }

  // 检查是否已登录 Vercel
  try {
    execSync('vercel whoami', { stdio: 'pipe' });
    logSuccess('已登录 Vercel');
  } catch (error) {
    logWarning('请先登录 Vercel: vercel login');
    process.exit(1);
  }

  // 部署
  runCommand('vercel --prod', 'Vercel 部署');
}

// 部署后验证
function postDeploymentValidation() {
  logStep('7', '部署后验证');
  
  logSuccess('部署完成！');
  log('\n📋 部署后检查清单:', 'bright');
  log('1. 访问部署的网站，确认页面正常加载');
  log('2. 测试用户登录功能');
  log('3. 检查 API 端点是否正常响应');
  log('4. 验证数据库连接和数据查询');
  log('5. 测试关键功能模块');
  
  log('\n🔗 有用的链接:', 'bright');
  log('- Vercel 仪表板: https://vercel.com/dashboard');
  log('- Supabase 仪表板: https://app.supabase.com/');
  log('- 项目文档: ./DEPLOYMENT.md');
}

// 主函数
function main() {
  log('🚀 开始部署自动化GEO智能评估平台', 'bright');
  log('=' * 50, 'cyan');

  try {
    checkEnvironmentVariables();
    checkDependencies();
    buildProject();
    checkDatabaseConnection();
    runTests();
    deployToVercel();
    postDeploymentValidation();
  } catch (error) {
    logError(`部署失败: ${error.message}`);
    process.exit(1);
  }
}

// 处理命令行参数
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log('自动化GEO智能评估平台 - 部署脚本', 'bright');
  log('\n用法:');
  log('  node scripts/deploy.js [选项]');
  log('\n选项:');
  log('  --help, -h     显示帮助信息');
  log('  --skip-tests   跳过测试步骤');
  log('  --build-only   仅执行构建，不部署');
  log('\n示例:');
  log('  node scripts/deploy.js');
  log('  node scripts/deploy.js --skip-tests');
  log('  node scripts/deploy.js --build-only');
  process.exit(0);
}

if (args.includes('--build-only')) {
  log('🔨 仅执行构建流程', 'bright');
  checkEnvironmentVariables();
  checkDependencies();
  buildProject();
  logSuccess('构建完成！');
  process.exit(0);
}

// 执行主函数
main();