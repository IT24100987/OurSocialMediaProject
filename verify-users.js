// Verify all demo users exist and can login
const axios = require('axios');

const users = [
  { email: 'admin@spoton.com', password: 'admin123', role: 'Admin' },
  { email: 'manager@spoton.com', password: 'manager123', role: 'Manager' },
  { email: 'staff@spoton.com', password: 'staff123', role: 'Staff' },
  { email: 'client@spoton.com', password: 'client123', role: 'Client' }
];

async function verifyUsers() {
  console.log('🔍 Verifying all demo users...\n');
  
  for (const user of users) {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: user.email,
        password: user.password
      });
      
      console.log(`✅ ${user.role}: ${user.email} - LOGIN SUCCESSFUL`);
      console.log(`   Name: ${response.data.name}`);
      console.log(`   Token: ${response.data.token.substring(0, 30)}...\n`);
      
    } catch (error) {
      console.log(`❌ ${user.role}: ${user.email} - LOGIN FAILED`);
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }
  }
}

verifyUsers();
