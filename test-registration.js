// Test registration endpoint
const axios = require('axios');

async function testRegistration() {
  try {
    console.log('🧪 Testing registration endpoint...');
    
    const registrationData = {
      name: 'Test Client',
      email: 'testclient@example.com',
      phone: '+1-555-9999',
      company: 'Test Company',
      package: 'Silver',
      password: 'test123'
    };
    
    const response = await axios.post('http://localhost:5000/api/clients/register', registrationData);
    
    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Registration failed:');
    console.log('Error:', error.response?.data || error.message);
  }
}

testRegistration();
