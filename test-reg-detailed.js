// Test registration with detailed error logging
const axios = require('axios');

async function testRegistrationDetailed() {
  try {
    console.log('🧪 Testing registration endpoint...');
    
    const registrationData = {
      name: 'Test Client',
      email: 'testclient2@example.com',
      phone: '+1-555-9999',
      company: 'Test Company',
      package: 'Silver',
      password: 'test123'
    };
    
    console.log('Sending data:', registrationData);
    
    try {
      const response = await axios.post('http://localhost:5000/api/clients/register', registrationData);
      console.log('✅ Registration successful!');
      console.log('Response:', response.data);
    } catch (error) {
      console.log('❌ Registration failed:');
      console.log('Status:', error.response?.status);
      console.log('Status Text:', error.response?.statusText);
      console.log('Response Data:', error.response?.data);
      console.log('Error Message:', error.message);
      
      if (error.response?.data?.error) {
        console.log('Detailed Error:', error.response.data.error);
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testRegistrationDetailed();
