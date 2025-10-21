const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // 创建用户表
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(100) NOT NULL,
          role VARCHAR(20) DEFAULT 'business_user' CHECK (role IN ('admin', 'geo_analyst', 'business_user')),
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
          last_login_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await client.query(createUsersTable);
    console.log('Users table created successfully');

    // 创建索引
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);');
    console.log('Indexes created successfully');

    // 插入测试用户
    const insertQuery = `
      INSERT INTO users (id, email, password_hash, name, role, status) VALUES 
      ('550e8400-e29b-41d4-a716-446655440000', 'admin@geo-platform.com', '$2a$12$ugFAIElMSDJgolqb7T6JmO1duxLu5Bu5W7ZP.z/3isHh3A3ysgLaS', '系统管理员', 'admin', 'active'),
      ('550e8400-e29b-41d4-a716-446655440001', 'analyst@geo-platform.com', '$2a$12$ugFAIElMSDJgolqb7T6JmO1duxLu5Bu5W7ZP.z/3isHh3A3ysgLaS', 'GEO分析师', 'geo_analyst', 'active')
      ON CONFLICT (email) DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        status = EXCLUDED.status;
    `;

    await client.query(insertQuery);
    console.log('Test users inserted successfully');

    // 验证用户是否存在
    const checkQuery = 'SELECT email, name, role, status FROM users WHERE email IN ($1, $2)';
    const checkResult = await client.query(checkQuery, ['admin@geo-platform.com', 'analyst@geo-platform.com']);
    
    console.log('Users in database:');
    checkResult.rows.forEach(user => {
      console.log(`- ${user.email}: ${user.name} (${user.role}) - ${user.status}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

setupDatabase()