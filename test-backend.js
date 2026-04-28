// Test backend connection
const axios = require('axios');

async function testBackend() {
  try {
    console.log('🧪 Testing backend connection...');
    
    // Test basic endpoint
    const response = await axios.get('http://localhost:5000/');
    console.log('✅ Backend response:', response.data);
    
    // Test auth endpoint
    try {
      const authResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'admin@spoton.com',
        password: 'admin123'
      });
      console.log('✅ Auth working:', authResponse.data.email);
    } catch (authError) {
      console.log('❌ Auth failed:', authError.response?.data || authError.message);
    }
    
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
  }
}

testBackend();
