// Test AI Integration
const axios = require('axios');

async function testAIIntegration() {
  try {
    console.log('🤖 Testing AI Integration...\n');
    
    // First login to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@spoton.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');
    
    // Test AI sentiment analysis
    console.log('2. Testing AI sentiment analysis...');
    try {
      const sentimentResponse = await axios.post('http://localhost:5000/api/ai/sentiment', 
        { 
          text: 'This product is amazing! I love it so much!',
          rating: 5 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ Sentiment analysis:', sentimentResponse.data);
    } catch (error) {
      console.log('❌ Sentiment analysis failed:', error.response?.data || error.message);
    }
    
    // Test AI chat
    console.log('\n3. Testing AI chat...');
    try {
      const chatResponse = await axios.post('http://localhost:5000/api/ai/chat', 
        { prompt: 'Hello, how are you?' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ AI chat response:', chatResponse.data.response);
    } catch (error) {
      console.log('❌ AI chat failed:', error.response?.data || error.message);
    }
    
    console.log('\n🎯 AI Integration Test Complete!');
    
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
  }
}

testAIIntegration();
