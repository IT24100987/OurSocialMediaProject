// Simple login test
const axios = require('axios');

async function testLogin() {
  try {
    // First register a user
    console.log('Registering admin user...');
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Admin User',
      email: 'admin@spoton.com',
      password: 'admin123',
      role: 'Admin'
    });
    console.log('✅ User registered:', registerResponse.data.email);

    // Then try to login
    console.log('\nTesting login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@spoton.com',
      password: 'admin123'
    });
    console.log('✅ Login successful!');
    console.log('Token:', loginResponse.data.token.substring(0, 50) + '...');
    console.log('User role:', loginResponse.data.role);

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Server is not running on port 5000');
      console.log('\nPlease start the server with:');
      console.log('  cd backend');
      console.log('  node server.js');
    } else {
      console.error('❌ Error:', error.response?.data || error.message);
    }
  }
}

testLogin();
