// Test login with the fixed API URL
const axios = require('axios');

// Create axios instance exactly like frontend
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

async function testFixedLogin() {
  try {
    console.log('Testing login with fixed API URL...');
    
    // Test all users
    const users = [
      { email: 'admin@spoton.com', password: 'admin123', role: 'Admin' },
      { email: 'manager@spoton.com', password: 'manager123', role: 'Manager' },
      { email: 'staff@spoton.com', password: 'staff123', role: 'Staff' },
      { email: 'client@spoton.com', password: 'client123', role: 'Client' }
    ];
    
    for (const user of users) {
      const response = await api.post('/auth/login', { 
        email: user.email, 
        password: user.password 
      });
      
      console.log(`✅ ${user.role} login successful!`);
      console.log(`   Name: ${response.data.name}`);
      console.log(`   Email: ${response.data.email}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
}

testFixedLogin();
