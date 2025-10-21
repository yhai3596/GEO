#!/usr/bin/env node

/**
 * 自动化GEO智能评估平台 - 数据库初始化脚本
 * 用于初始化Supabase数据库，包括表结构和初始数据
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

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

// 检查环境变量
function checkEnvironment() {
  logStep('1', '检查环境配置');
  
  const requiredVars = ['DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    logError('缺少必要的环境变量:');
    missingVars.forEach(varName => {
      logError(`  - ${varName}`);
    });
    logError('请在 .env 文件中配置这些变量');
    process.exit(1);
  }
  
  logSuccess('环境配置检查通过');
}

// 创建 Supabase 客户端
async function createSupabaseClient() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    logSuccess('Supabase 客户端创建成功');
    return supabase;
  } catch (error) {
    logError(`创建 Supabase 客户端失败: ${error.message}`);
    logError('请确保已安装 @supabase/supabase-js 依赖');
    process.exit(1);
  }
}

// 执行 SQL 文件
async function executeSqlFile(supabase, filePath, description) {
  try {
    if (!fs.existsSync(filePath)) {
      logWarning(`SQL 文件不存在: ${filePath}`);
      return false;
    }
    
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // 分割 SQL 语句（简单的分割，基于分号）
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    log(`执行 ${statements.length} 条 SQL 语句...`, 'blue');
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
          if (error) {
            // 如果是表已存在等非致命错误，继续执行
            if (error.message.includes('already exists') || 
                error.message.includes('duplicate key') ||
                error.message.includes('ON CONFLICT')) {
              logWarning(`跳过已存在的对象: ${error.message.substring(0, 100)}...`);
            } else {
              throw error;
            }
          }
        } catch (error) {
          logWarning(`SQL 语句执行警告 (${i + 1}/${statements.length}): ${error.message.substring(0, 100)}...`);
        }
      }
    }
    
    logSuccess(`${description} 执行完成`);
    return true;
  } catch (error) {
    logError(`${description} 执行失败: ${error.message}`);
    return false;
  }
}

// 使用原生 PostgreSQL 连接执行 SQL
async function executeWithPgClient(sqlContent, description) {
  try {
    const { Client } = await import('pg');
    
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    await client.connect();
    logSuccess('PostgreSQL 连接成功');
    
    // 分割并执行 SQL 语句
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    log(`执行 ${statements.length} 条 SQL 语句...`, 'blue');
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await client.query(statement);
        } catch (error) {
          // 忽略一些常见的非致命错误
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key value') ||
              error.message.includes('ON CONFLICT')) {
            logWarning(`跳过已存在的对象 (${i + 1}/${statements.length})`);
          } else {
            logWarning(`SQL 执行警告 (${i + 1}/${statements.length}): ${error.message.substring(0, 100)}...`);
          }
        }
      }
    }
    
    await client.end();
    logSuccess(`${description} 执行完成`);
    return true;
  } catch (error) {
    logError(`${description} 执行失败: ${error.message}`);
    return false;
  }
}

// 初始化数据库结构
async function initializeSchema() {
  logStep('2', '初始化数据库结构');
  
  const schemaFile = path.join(process.cwd(), 'supabase', 'migrations', '001_initial_schema.sql');
  
  if (!fs.existsSync(schemaFile)) {
    logError(`数据库结构文件不存在: ${schemaFile}`);
    return false;
  }
  
  const sqlContent = fs.readFileSync(schemaFile, 'utf8');
  return await executeWithPgClient(sqlContent, '数据库结构初始化');
}

// 初始化数据
async function initializeData() {
  logStep('3', '初始化数据');
  
  const dataFile = path.join(process.cwd(), 'supabase', 'migrations', '002_initial_data.sql');
  
  if (!fs.existsSync(dataFile)) {
    logWarning(`初始数据文件不存在: ${dataFile}`);
    return true; // 数据文件是可选的
  }
  
  const sqlContent = fs.readFileSync(dataFile, 'utf8');
  return await executeWithPgClient(sqlContent, '初始数据插入');
}

// 验证数据库
async function validateDatabase() {
  logStep('4', '验证数据库');
  
  try {
    const { Client } = require('pg');
    
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    await client.connect();
    
    // 检查主要表是否存在
    const tables = ['users', 'keywords', 'geo_results', 'citations', 'alert_rules', 'competitors'];
    
    for (const table of tables) {
      const result = await client.query(
        `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)`,
        [table]
      );
      
      if (result.rows[0].exists) {
        logSuccess(`表 ${table} 存在`);
      } else {
        logError(`表 ${table} 不存在`);
      }
    }
    
    // 检查用户数据
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    log(`用户表记录数: ${userCount.rows[0].count}`, 'blue');
    
    // 检查关键词数据
    const keywordCount = await client.query('SELECT COUNT(*) FROM keywords');
    log(`关键词表记录数: ${keywordCount.rows[0].count}`, 'blue');
    
    await client.end();
    logSuccess('数据库验证完成');
    return true;
  } catch (error) {
    logError(`数据库验证失败: ${error.message}`);
    return false;
  }
}

// 显示使用说明
function showUsageInstructions() {
  logStep('5', '使用说明');
  
  log('\n🎉 数据库初始化完成！', 'bright');
  log('\n📋 测试账户信息:', 'bright');
  log('管理员账户:');
  log('  邮箱: admin@geo-platform.com');
  log('  密码: admin123');
  log('  角色: 系统管理员');
  
  log('\nGEO分析师账户:');
  log('  邮箱: analyst@geo-platform.com');
  log('  密码: admin123');
  log('  角色: GEO分析师');
  
  log('\n业务用户账户:');
  log('  邮箱: business@geo-platform.com');
  log('  密码: admin123');
  log('  角色: 业务用户');
  
  log('\n🔗 有用的链接:', 'bright');
  log('- Supabase 仪表板: https://app.supabase.com/');
  log('- 数据库表结构: ./supabase/migrations/001_initial_schema.sql');
  log('- 初始数据: ./supabase/migrations/002_initial_data.sql');
  
  log('\n⚠️  注意事项:', 'yellow');
  log('1. 请在生产环境中修改默认密码');
  log('2. 根据需要调整 RLS 策略');
  log('3. 定期备份数据库');
  log('4. 监控数据库性能和存储使用情况');
}

// 主函数
async function main() {
  log('🗄️  开始初始化自动化GEO智能评估平台数据库', 'bright');
  log('=' * 60, 'cyan');
  
  try {
    checkEnvironment();
    
    const schemaSuccess = await initializeSchema();
    if (!schemaSuccess) {
      logError('数据库结构初始化失败，停止执行');
      process.exit(1);
    }
    
    const dataSuccess = await initializeData();
    if (!dataSuccess) {
      logWarning('初始数据插入失败，但继续执行');
    }
    
    const validationSuccess = await validateDatabase();
    if (!validationSuccess) {
      logWarning('数据库验证失败，请手动检查');
    }
    
    showUsageInstructions();
    
  } catch (error) {
    logError(`初始化失败: ${error.message}`);
    process.exit(1);
  }
}

// 处理命令行参数
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log('自动化GEO智能评估平台 - 数据库初始化脚本', 'bright');
  log('\n用法:');
  log('  node scripts/init-database.js [选项]');
  log('\n选项:');
  log('  --help, -h     显示帮助信息');
  log('  --schema-only  仅初始化数据库结构');
  log('  --data-only    仅初始化数据（需要先有结构）');
  log('\n示例:');
  log('  node scripts/init-database.js');
  log('  node scripts/init-database.js --schema-only');
  log('  node scripts/init-database.js --data-only');
  process.exit(0);
}

if (args.includes('--schema-only')) {
  log('🏗️  仅初始化数据库结构', 'bright');
  checkEnvironment();
  initializeSchema().then(success => {
    if (success) {
      logSuccess('数据库结构初始化完成！');
    } else {
      process.exit(1);
    }
  });
} else if (args.includes('--data-only')) {
  log('📊 仅初始化数据', 'bright');
  checkEnvironment();
  initializeData().then(success => {
    if (success) {
      logSuccess('数据初始化完成！');
    } else {
      process.exit(1);
    }
  });
} else {
  // 执行完整初始化
  main();
}