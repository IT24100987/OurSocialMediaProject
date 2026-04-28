// Simple AI test
require('dotenv').config();
const { callClaude } = require('./backend/utils/aiHelper');

async function testSimple() {
  try {
    console.log('Testing simple AI call...');
    const response = await callClaude('Hello, how are you?');
    console.log('Response:', response);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSimple();
