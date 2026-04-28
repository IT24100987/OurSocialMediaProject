// Test AI directly
require('dotenv').config();
const { callClaude } = require('./utils/aiHelper');

async function testAIDirect() {
  try {
    console.log('🤖 Testing AI Direct Call...');
    
    const response = await callClaude('Hello! Can you tell me a short joke?');
    
    console.log('✅ AI Response:', response);
    
  } catch (error) {
    console.error('❌ AI Test Failed:', error.message);
  }
}

testAIDirect();
