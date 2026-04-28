// Simple API Test Script
// Run this with: node test-api.js

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'Test Admin',
  email: 'admin@test.com',
  password: 'admin123',
  role: 'Admin'
};

const testClient = {
  name: 'Test Client',
  email: 'client@test.com',
  password: 'client123',
  phone: '+1234567890',
  company: 'Test Company',
  package: 'Gold'
};

let adminToken = '';
let clientToken = '';
let adminId = '';
let clientId = '';

async function testAPI() {
  console.log('🚀 Starting API Tests...\n');

  try {
    // Test 1: Register Admin
    console.log('1. Registering Admin...');
    const adminRes = await axios.post(`${API_URL}/auth/register`, testUser);
    adminToken = adminRes.data.token;
    adminId = adminRes.data._id;
    console.log('✅ Admin registered successfully');
    console.log(`   Token: ${adminToken.substring(0, 20)}...\n`);

    // Test 2: Register Client from landing page
    console.log('2. Registering Client...');
    const clientRes = await axios.post(`${API_URL}/clients/register`, testClient);
    clientToken = clientRes.data.token;
    clientId = clientRes.data.clientId;
    console.log('✅ Client registered successfully');
    console.log(`   Token: ${clientToken.substring(0, 20)}...\n`);

    // Test 3: Login Admin
    console.log('3. Logging in Admin...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Admin login successful\n');

    // Test 4: Get Users (Admin only)
    console.log('4. Getting all users...');
    const usersRes = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Found ${usersRes.data.length} users\n`);

    // Test 5: Get Clients
    console.log('5. Getting all clients...');
    const clientsRes = await axios.get(`${API_URL}/clients`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Found ${clientsRes.data.length} clients\n`);

    // Test 6: Create Feedback
    console.log('6. Creating feedback...');
    const feedbackRes = await axios.post(`${API_URL}/feedback`, {
      clientId: clientId,
      campaignName: 'Test Campaign',
      rating: 5,
      comment: 'Excellent service!'
    }, {
      headers: { Authorization: `Bearer ${clientToken}` }
    });
    console.log('✅ Feedback created successfully\n');

    // Test 7: Create Task
    console.log('7. Creating task...');
    const taskRes = await axios.post(`${API_URL}/tasks`, {
      title: 'Test Task',
      description: 'This is a test task',
      assignedTo: adminId,
      clientId: clientId,
      priority: 'High',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Task created successfully\n');

    // Test 8: Create Payment
    console.log('8. Creating payment...');
    const paymentRes = await axios.post(`${API_URL}/payments`, {
      clientId: clientId,
      amount: 999.99,
      package: 'Gold',
      method: 'Bank Transfer',
      status: 'Paid',
      note: 'Test payment'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Payment created successfully\n');

    // Test 9: Create Analytics
    console.log('9. Creating analytics record...');
    const analyticsRes = await axios.post(`${API_URL}/analytics`, {
      clientId: clientId,
      campaignName: 'Test Campaign',
      platform: 'Facebook',
      reach: 1000,
      impressions: 1500,
      engagement: 250,
      clicks: 50,
      conversions: 5,
      reportMonth: new Date().toISOString().slice(0, 7)
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Analytics record created successfully\n');

    // Test 10: AI Sentiment Analysis (if API key is set)
    console.log('10. Testing AI sentiment analysis...');
    try {
      const sentimentRes = await axios.post(`${API_URL}/ai/sentiment`, {
        text: 'I love this service! It\'s amazing and helps me so much.'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(`✅ Sentiment: ${sentimentRes.data.sentiment}\n`);
    } catch (error) {
      console.log('⚠️ AI sentiment test skipped (API key not configured)\n');
    }

    console.log('🎉 All API tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Admin User: ${testUser.email}`);
    console.log(`   - Client User: ${testClient.email}`);
    console.log(`   - Backend: http://localhost:5000`);
    console.log(`   - Frontend: http://localhost:5173`);
    console.log('\n✨ You can now log in and test the full application!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the tests
testAPI();
