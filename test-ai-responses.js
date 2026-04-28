// Test different AI responses
const axios = require('axios');

async function testAIResponses() {
  try {
    console.log('🤖 Testing AI Response Variations...\n');
    
    // Login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@spoton.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    
    // Test different prompts
    const testPrompts = [
      'Hello',
      'I need help',
      'Can you hear me',
      'What is SpotOn CMS',
      'What features do you have'
    ];
    
    for (const prompt of testPrompts) {
      try {
        const response = await axios.post('http://localhost:5000/api/ai/chat', 
          { prompt },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`✅ "${prompt}" -> ${response.data.response.substring(0, 80)}...`);
      } catch (error) {
        console.log(`❌ "${prompt}" -> ERROR: ${error.response?.data?.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAIResponses();
