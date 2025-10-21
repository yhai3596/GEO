#!/usr/bin/env node

/**
 * Supabase数据库自动初始化脚本
 * 
 * 此脚本会：
 * 1. 读取supabase/migrations/目录下的SQL文件
 * 2. 连接到Supabase数据库
 * 3. 按顺序执行SQL脚本
 * 4. 提供详细的执行日志
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
import dotenv from 'dotenv';

const { Client } = pkg;

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量 - 覆盖系统环境变量
dotenv.config({ path: join(__dirname, '..', '.env'), override: true });

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

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  colorLog('cyan', `[步骤 ${step}] ${message}`);
}

function logSuccess(message) {
  colorLog('green', `✅ ${message}`);
}

function logError(message) {
  colorLog('red', `❌ ${message}`);
}

function logWarning(message) {
  colorLog('yellow', `⚠️  ${message}`);
}

function logInfo(message) {
  colorLog('blue', `ℹ️  ${message}`);
}

// 检查数据库连接
async function checkDatabaseConnection(client) {
  try {
    await client.connect();
    logSuccess('数据库连接成功');
    
    // 测试查询
    const result = await client.query('SELECT version()');
    logInfo(`PostgreSQL版本: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
    
    return true;
  } catch (error) {
    logError(`数据库连接失败: ${error.message}`);
    
    if (error.message.includes('password authentication failed')) {
      logWarning('密码认证失败，请检查 .env 文件中的 DATABASE_URL 密码是否正确');
      logInfo('您可以在 Supabase 控制台的 Settings → Database 中查看正确的连接字符串');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      logWarning('无法解析数据库主机名，请检查网络连接和 DATABASE_URL 配置');
    }
    
    return false;
  }
}

// 检查表是否存在
async function checkTableExists(client, tableName) {
  try {
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);
    
    return result.rows[0].exists;
  } catch (error) {
    logError(`检查表 ${tableName} 时出错: ${error.message}`);
    return false;
  }
}

// 执行SQL文件
async function executeSQLFile(client, filePath, description) {
  try {
    logInfo(`正在执行: ${description}`);
    
    const sql = readFileSync(filePath, 'utf8');
    
    // 智能分割SQL语句，处理函数定义
    const statements = [];
    let currentStatement = '';
    let inFunction = false;
    let dollarQuoteTag = null;
    
    const lines = sql.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 跳过注释行
      if (trimmedLine.startsWith('--') || trimmedLine === '') {
        continue;
      }
      
      currentStatement += line + '\n';
      
      // 检查是否进入或退出 $$ 块
      const dollarMatches = line.match(/\$([^$]*)\$/g);
      if (dollarMatches) {
        for (const match of dollarMatches) {
          if (!inFunction) {
            dollarQuoteTag = match;
            inFunction = true;
          } else if (match === dollarQuoteTag) {
            inFunction = false;
            dollarQuoteTag = null;
          }
        }
      }
      
      // 如果不在函数内且行以分号结尾，则结束当前语句
      if (!inFunction && trimmedLine.endsWith(';')) {
        const statement = currentStatement.trim();
        if (statement.length > 0) {
          statements.push(statement);
        }
        currentStatement = '';
      }
    }
    
    // 添加最后一个语句（如果有）
    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement.trim());
    }
    
    logInfo(`发现 ${statements.length} 个SQL语句`);
    
    let successCount = 0;
    let skipCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        // 跳过注释和空语句
        if (statement.startsWith('--') || statement.trim() === '') {
          continue;
        }
        
        await client.query(statement);
        successCount++;
        
        // 显示进度
        if (i % 10 === 0 || i === statements.length - 1) {
          process.stdout.write(`\r执行进度: ${i + 1}/${statements.length} (${Math.round((i + 1) / statements.length * 100)}%)`);
        }
        
      } catch (error) {
        // 如果是"已存在"错误，跳过
        if (error.code === '42P07' || error.code === '42710' || error.message.includes('already exists')) {
          skipCount++;
          continue;
        }
        
        // 如果是"冲突"错误（ON CONFLICT），跳过
        if (error.code === '23505') {
          skipCount++;
          continue;
        }
        
        logError(`\n执行SQL语句时出错: ${error.message}`);
        logError(`问题语句: ${statement.substring(0, 100)}...`);
        throw error;
      }
    }
    
    console.log(); // 换行
    logSuccess(`${description} 执行完成`);
    logInfo(`成功执行: ${successCount} 个语句，跳过: ${skipCount} 个语句`);
    
  } catch (error) {
    logError(`执行 ${description} 失败: ${error.message}`);
    throw error;
  }
}

// 验证初始化结果
async function validateInitialization(client) {
  try {
    logStep(4, '验证数据库初始化结果');
    
    // 检查关键表是否存在
    const tables = ['users', 'keywords', 'geo_results', 'citations', 'alert_rules', 'competitors'];
    const tableStatus = {};
    
    for (const table of tables) {
      const exists = await checkTableExists(client, table);
      tableStatus[table] = exists;
      
      if (exists) {
        // 获取表的记录数
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
        const count = parseInt(countResult.rows[0].count);
        logSuccess(`表 ${table}: 存在 (${count} 条记录)`);
      } else {
        logError(`表 ${table}: 不存在`);
      }
    }
    
    // 检查视图是否存在
    const views = ['user_keyword_stats', 'competitor_mention_stats', 'daily_geo_stats'];
    for (const view of views) {
      try {
        await client.query(`SELECT 1 FROM ${view} LIMIT 1`);
        logSuccess(`视图 ${view}: 存在`);
      } catch (error) {
        logError(`视图 ${view}: 不存在或无法访问`);
      }
    }
    
    // 检查扩展
    const extensionResult = await client.query(`
      SELECT extname FROM pg_extension WHERE extname = 'uuid-ossp'
    `);
    
    if (extensionResult.rows.length > 0) {
      logSuccess('UUID扩展: 已启用');
    } else {
      logWarning('UUID扩展: 未启用');
    }
    
    return Object.values(tableStatus).every(exists => exists);
    
  } catch (error) {
    logError(`验证初始化结果时出错: ${error.message}`);
    return false;
  }
}

// 主函数
async function main() {
  colorLog('bright', '🚀 Supabase数据库初始化脚本');
  colorLog('bright', '=====================================');
  
  // 检查环境变量
  if (!process.env.DATABASE_URL) {
    logError('未找到 DATABASE_URL 环境变量');
    logInfo('请确保 .env 文件存在并包含正确的 DATABASE_URL');
    process.exit(1);
  }
  
  if (process.env.DATABASE_URL.includes('your-password')) {
    logError('DATABASE_URL 中包含占位符密码 "your-password"');
    logInfo('请在 Supabase 控制台获取正确的数据库密码并更新 .env 文件');
    logInfo('访问: https://supabase.com → 您的项目 → Settings → Database');
    process.exit(1);
  }
  
  logInfo(`数据库URL: ${process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@')}`);
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    // 步骤1: 检查数据库连接
    logStep(1, '检查数据库连接');
    const connected = await checkDatabaseConnection(client);
    if (!connected) {
      process.exit(1);
    }
    
    // 步骤2: 执行表结构脚本
    logStep(2, '创建数据库表结构');
    const schemaPath = join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');
    await executeSQLFile(client, schemaPath, '数据库表结构创建');
    
    // 步骤3: 执行初始数据脚本
    logStep(3, '插入初始数据');
    const dataPath = join(__dirname, '..', 'supabase', 'migrations', '002_initial_data.sql');
    await executeSQLFile(client, dataPath, '初始数据插入');
    
    // 步骤4: 验证初始化结果
    const isValid = await validateInitialization(client);
    
    if (isValid) {
      colorLog('bright', '\n🎉 数据库初始化完成！');
      logSuccess('所有表和数据已成功创建');
      logInfo('您现在可以启动应用程序了');
      
      // 提供下一步指导
      colorLog('bright', '\n📋 下一步操作:');
      logInfo('1. 确保前端服务正在运行: npm run dev');
      logInfo('2. 启动后端服务: npm run server');
      logInfo('3. 访问应用: http://localhost:5173');
      logInfo('4. 使用测试账号登录:');
      logInfo('   - 管理员: admin@geo-platform.com / admin123');
      logInfo('   - 分析师: analyst@geo-platform.com / admin123');
      
    } else {
      logWarning('数据库初始化可能不完整，请检查上述错误信息');
    }
    
  } catch (error) {
    logError(`初始化过程中发生错误: ${error.message}`);
    process.exit(1);
  } finally {
    await client.end();
    logInfo('数据库连接已关闭');
  }
}

// 运行主函数
main().catch(error => {
  logError(`未处理的错误: ${error.message}`);
  process.exit(1);
});