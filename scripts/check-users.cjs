const { Client } = require('pg');
require('dotenv').config();

async function checkUsers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const query = 'SELECT id, email, name, role, status, created_at FROM users ORDER BY created_at DESC LIMIT 10';
    const result = await client.query(query);
    
    console.log('Recent users in database:');
    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.name} (${user.role}) - ${user.status} - ${user.created_at}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUsers();