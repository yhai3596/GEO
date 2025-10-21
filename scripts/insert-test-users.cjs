const { Client } = require('pg');
require('dotenv').config();

async function insertTestUsers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

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

    const result = await client.query(insertQuery);
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

insertTestUsers();