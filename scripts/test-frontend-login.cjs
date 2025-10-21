const axios = require('axios');

async function testFrontendLogin() {
  console.log('Testing frontend login functionality...');
  
  const testCases = [
    {
      email: 'admin@geo-platform.com',
      password: 'admin123',
      expectedRole: 'admin'
    },
    {
      email: 'analyst@geo-platform.com', 
      password: 'admin123',
      expectedRole: 'geo_analyst'
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\nTesting login for: ${testCase.email}`);
      
      const response = await axios.post('http://localhost:3002/api/auth/login', {
        email: testCase.email,
        password: testCase.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log(`✅ Login successful for ${testCase.email}`);
        console.log(`   Role: ${response.data.data.user.role}`);
        console.log(`   Name: ${response.data.data.user.name}`);
        console.log(`   Token received: ${response.data.data.token ? 'Yes' : 'No'}`);
        
        if (response.data.data.user.role === testCase.expectedRole) {
          console.log(`   ✅ Role matches expected: ${testCase.expectedRole}`);
        } else {
          console.log(`   ❌ Role mismatch. Expected: ${testCase.expectedRole}, Got: ${response.data.data.user.role}`);
        }
      } else {
        console.log(`❌ Login failed for ${testCase.email}: ${response.data.message}`);
      }
    } catch (error) {
      console.log(`❌ Error testing ${testCase.email}:`, error.response?.data?.message || error.message);
    }
  }

  // Test invalid credentials
  try {
    console.log(`\nTesting invalid credentials...`);
    const response = await axios.post('http://localhost:3002/api/auth/login', {
      email: 'admin@geo-platform.com',
      password: 'wrongpassword'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.data.success) {
      console.log(`✅ Invalid credentials correctly rejected: ${response.data.message}`);
    } else {
      console.log(`❌ Invalid credentials were accepted - this is a security issue!`);
    }
  } catch (error) {
    if (error.response?.status === 401) {
      console.log(`✅ Invalid credentials correctly rejected with 401 status`);
    } else {
      console.log(`❌ Unexpected error with invalid credentials:`, error.message);
    }
  }

  console.log('\n🎉 Frontend login testing completed!');
  console.log('\nNext steps:');
  console.log('1. Open http://localhost:5173 in your browser');
  console.log('2. Try logging in with:');
  console.log('   - admin@geo-platform.com / admin123');
  console.log('   - analyst@geo-platform.com / admin123');
  console.log('3. Verify that the login works and redirects to the dashboard');
}

testFrontendLogin()