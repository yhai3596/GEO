#!/usr/bin/env node

/**
 * GEO智能评估平台 - 快速部署脚本
 * 
 * 此脚本帮助用户快速部署项目到Vercel
 * 包含环境检查、构建测试和部署指导
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

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

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description}`, 'red');
    return false;
  }
}

function runCommand(command, description) {
  try {
    log(`🔄 ${description}...`, 'yellow');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} 完成`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} 失败`, 'red');
    console.error(error.message);
    return false;
  }
}

function main() {
  log('🚀 GEO智能评估平台 - 部署准备检查', 'cyan');
  log('=' * 50, 'cyan');

  // 1. 检查必需文件
  log('\n📋 检查项目文件...', 'blue');
  const requiredFiles = [
    ['package.json', 'package.json 配置文件'],
    ['vercel.json', 'Vercel 部署配置'],
    ['.env.example', '环境变量模板'],
    ['src/main.tsx', '前端入口文件'],
    ['api/index.ts', 'API入口文件'],
    ['VERCEL_DEPLOYMENT.md', 'Vercel部署指南'],
    ['DEPLOYMENT_CHECKLIST.md', '部署检查清单']
  ];

  let allFilesExist = true;
  for (const [file, desc] of requiredFiles) {
    if (!checkFile(file, desc)) {
      allFilesExist = false;
    }
  }

  if (!allFilesExist) {
    log('\n❌ 缺少必需文件，请检查项目完整性', 'red');
    process.exit(1);
  }

  // 2. 检查环境变量
  log('\n🔧 检查环境配置...', 'blue');
  if (fs.existsSync('.env')) {
    log('✅ .env 文件存在', 'green');
    
    const envContent = fs.readFileSync('.env', 'utf8');
    const requiredEnvVars = [
      'DATABASE_URL',
      'SUPABASE_URL', 
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'JWT_SECRET'
    ];

    let envComplete = true;
    for (const envVar of requiredEnvVars) {
      if (envContent.includes(`${envVar}=`) && !envContent.includes(`${envVar}=your-`)) {
        log(`✅ ${envVar} 已配置`, 'green');
      } else {
        log(`❌ ${envVar} 未配置或使用默认值`, 'red');
        envComplete = false;
      }
    }

    if (!envComplete) {
      log('\n⚠️  请完成环境变量配置后再进行部署', 'yellow');
      log('📖 参考文档: .env.example', 'yellow');
    }
  } else {
    log('⚠️  .env 文件不存在，请复制 .env.example 并配置', 'yellow');
  }

  // 3. 检查依赖
  log('\n📦 检查项目依赖...', 'blue');
  if (!fs.existsSync('node_modules')) {
    log('⚠️  依赖未安装，正在安装...', 'yellow');
    if (!runCommand('npm install', '安装项目依赖')) {
      process.exit(1);
    }
  } else {
    log('✅ 项目依赖已安装', 'green');
  }

  // 4. 运行构建测试
  log('\n🔨 运行构建测试...', 'blue');
  if (!runCommand('npm run check', 'TypeScript 类型检查')) {
    log('❌ TypeScript 检查失败，请修复错误后重试', 'red');
    process.exit(1);
  }

  if (!runCommand('npm run build', '前端构建测试')) {
    log('❌ 前端构建失败，请修复错误后重试', 'red');
    process.exit(1);
  }

  if (!runCommand('npm run server:build', '后端构建测试')) {
    log('❌ 后端构建失败，请修复错误后重试', 'red');
    process.exit(1);
  }

  // 5. Git 检查
  log('\n📝 检查Git状态...', 'blue');
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
      log('⚠️  有未提交的更改，建议先提交代码', 'yellow');
      log('运行: git add . && git commit -m "Ready for deployment"', 'yellow');
    } else {
      log('✅ Git状态干净', 'green');
    }

    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    log(`✅ Git远程仓库: ${remoteUrl}`, 'green');
  } catch (error) {
    log('⚠️  Git仓库未初始化或未配置远程仓库', 'yellow');
    log('请先初始化Git仓库并推送到GitHub', 'yellow');
  }

  // 6. 部署指导
  log('\n🎯 部署指导', 'magenta');
  log('=' * 30, 'magenta');
  log('✅ 项目准备完成！现在可以部署到Vercel了', 'green');
  log('', 'reset');
  log('📋 部署步骤:', 'bright');
  log('1. 确保代码已推送到GitHub仓库', 'reset');
  log('2. 访问 https://vercel.com 并登录', 'reset');
  log('3. 点击 "New Project" 导入您的GitHub仓库', 'reset');
  log('4. 配置环境变量 (参考 VERCEL_DEPLOYMENT.md)', 'reset');
  log('5. 点击 "Deploy" 开始部署', 'reset');
  log('', 'reset');
  log('📖 详细指南:', 'bright');
  log('• Vercel部署: ./VERCEL_DEPLOYMENT.md', 'cyan');
  log('• 检查清单: ./DEPLOYMENT_CHECKLIST.md', 'cyan');
  log('• 环境变量: ./.env.example', 'cyan');
  log('', 'reset');
  log('🚀 一键部署按钮:', 'bright');
  log('https://vercel.com/new/clone?repository-url=YOUR_GITHUB_REPO_URL', 'cyan');
  log('', 'reset');
  log('🎉 祝您部署成功！', 'green');
}

// 运行主函数
main();