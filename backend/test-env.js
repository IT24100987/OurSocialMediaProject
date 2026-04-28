// Test environment variables
require('dotenv').config();

console.log('🔍 Testing Environment Variables...');
console.log('ANTHROPIC_API_KEY exists:', !!process.env.ANTHROPIC_API_KEY);
console.log('ANTHROPIC_API_KEY length:', process.env.ANTHROPIC_API_KEY?.length);
console.log('ANTHROPIC_API_KEY starts with sk-ant:', process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant'));
console.log('First 20 chars:', process.env.ANTHROPIC_API_KEY?.substring(0, 20) + '...');
