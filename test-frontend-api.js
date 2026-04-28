// Test the exact API call the frontend makes
const axios = require('axios');

async function testFrontendAPI() {
  try {
    console.log('Testing frontend API endpoint...');
    
    // This is the exact call the frontend makes
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@spoton.com',
      password: 'admin123'
    });
    
    console.log('✅ Frontend API call successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Frontend API call failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testFrontendAPI();
