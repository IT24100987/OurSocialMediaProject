// Demo Setup Script - Creates users for demonstration
// Run with: node demo-setup.js

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Demo users with credentials
const demoUsers = [
  {
    name: 'Sarah Admin',
    email: 'admin@spoton.com',
    password: 'admin123',
    role: 'Admin'
  },
  {
    name: 'John Manager',
    email: 'manager@spoton.com',
    password: 'manager123',
    role: 'Manager'
  },
  {
    name: 'Mike Staff',
    email: 'staff@spoton.com',
    password: 'staff123',
    role: 'Staff'
  },
  {
    name: 'Jane Client',
    email: 'client@spoton.com',
    password: 'client123',
    role: 'Client'
  }
];

// Demo clients
const demoClients = [
  {
    name: 'TechStart Inc',
    email: 'contact@techstart.com',
    phone: '+1-555-0101',
    company: 'TechStart Inc',
    package: 'Platinum',
    notes: 'High-value tech client'
  },
  {
    name: 'FoodBox Delivery',
    email: 'hello@foodbox.com',
    phone: '+1-555-0102',
    company: 'FoodBox Delivery',
    package: 'Gold',
    notes: 'Food delivery service'
  },
  {
    name: 'GreenLife Organic',
    email: 'info@greenlife.com',
    phone: '+1-555-0103',
    company: 'GreenLife Organic',
    package: 'Diamond',
    notes: 'Premium organic products'
  }
];

// Demo feedback
const demoFeedback = [
  {
    campaignName: 'Summer Campaign 2025',
    rating: 5,
    comment: 'Excellent service! Our conversion rates increased by 40%'
  },
  {
    campaignName: 'Product Launch',
    rating: 4,
    comment: 'Good results, but could use more analytics features'
  },
  {
    campaignName: 'Holiday Special',
    rating: 2,
    comment: 'Response time was slow during peak season'
  }
];

async function setupDemo() {
  console.log('🚀 Setting up SpotOn CMS Demo...\n');

  try {
    // 1. Create demo users
    console.log('1. Creating demo users...');
    const createdUsers = [];
    
    for (const user of demoUsers) {
      try {
        const response = await axios.post(`${API_URL}/auth/register`, user);
        createdUsers.push({ ...response.data, role: user.role });
        console.log(`✅ Created ${user.role}: ${user.email}`);
      } catch (error) {
        // User might already exist, try to login
        try {
          const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: user.email,
            password: user.password
          });
          createdUsers.push({ ...loginResponse.data, role: user.role });
          console.log(`✅ Existing ${user.role}: ${user.email}`);
        } catch (loginError) {
          console.log(`❌ Failed to create/login ${user.role}: ${user.email}`);
          console.log(`   Error: ${loginError.response?.data?.message || loginError.message}`);
        }
      }
    }

    // 2. Create demo clients
    console.log('\n2. Creating demo clients...');
    const adminToken = createdUsers.find(u => u.role === 'Admin')?.token;
    const createdClients = [];

    if (!adminToken) {
      console.log('❌ No admin token found, skipping client creation');
    } else {
      for (const client of demoClients) {
        try {
          const response = await axios.post(`${API_URL}/clients`, client, {
            headers: { Authorization: `Bearer ${adminToken}` }
          });
          createdClients.push(response.data);
          console.log(`✅ Created client: ${client.name}`);
        } catch (error) {
          console.log(`❌ Failed to create client: ${client.name}`);
          console.log(`   Error: ${error.response?.data?.message || error.message}`);
        }
      }
    }

    // 3. Create demo feedback
    console.log('\n3. Creating demo feedback...');
    const clientToken = createdUsers.find(u => u.role === 'Client')?.token;
    
    if (!clientToken || createdClients.length === 0) {
      console.log('❌ No client token or clients found, skipping feedback creation');
    } else {
      for (let i = 0; i < demoFeedback.length; i++) {
        try {
          const feedback = {
            ...demoFeedback[i],
            clientId: createdClients[i]?._id || createdClients[0]?._id
          };
          
          const response = await axios.post(`${API_URL}/feedback`, feedback, {
            headers: { Authorization: `Bearer ${clientToken}` }
          });
          console.log(`✅ Created feedback: ${feedback.campaignName}`);
        } catch (error) {
          console.log(`❌ Failed to create feedback`);
          console.log(`   Error: ${error.response?.data?.message || error.message}`);
        }
      }
    }

    // 4. Create demo tasks
    console.log('\n4. Creating demo tasks...');
    const staffUser = createdUsers.find(u => u.role === 'Staff');
    
    const demoTasks = [
      {
        title: 'Review Q2 Campaign Performance',
        description: 'Analyze campaign metrics and prepare report',
        assignedTo: staffUser._id,
        clientId: createdClients[0]?._id,
        priority: 'High',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Client Onboarding Call',
        description: 'Schedule onboarding call for new client',
        assignedTo: staffUser._id,
        clientId: createdClients[1]?._id,
        priority: 'Medium',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    for (const task of demoTasks) {
      try {
        const response = await axios.post(`${API_URL}/tasks`, task, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`✅ Created task: ${task.title}`);
      } catch (error) {
        console.log(`❌ Failed to create task: ${task.title}`);
      }
    }

    // 5. Create demo payments
    console.log('\n5. Creating demo payments...');
    const demoPayments = [
      {
        clientId: createdClients[0]?._id,
        amount: 5000,
        package: 'Platinum',
        method: 'Bank Transfer',
        status: 'Paid',
        note: 'Q2 Platinum package payment'
      },
      {
        clientId: createdClients[1]?._id,
        amount: 3000,
        package: 'Gold',
        method: 'Credit Card',
        status: 'Paid',
        note: 'Gold package monthly payment'
      },
      {
        clientId: createdClients[2]?._id,
        amount: 7500,
        package: 'Diamond',
        method: 'Bank Transfer',
        status: 'Pending',
        note: 'Diamond package - pending clearance'
      }
    ];

    for (const payment of demoPayments) {
      try {
        const response = await axios.post(`${API_URL}/payments`, payment, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`✅ Created payment: $${payment.amount}`);
      } catch (error) {
        console.log(`❌ Failed to create payment`);
      }
    }

    // 6. Create demo analytics
    console.log('\n6. Creating demo analytics...');
    const demoAnalytics = [
      {
        clientId: createdClients[0]?._id,
        campaignName: 'Summer Campaign 2025',
        platform: 'Facebook',
        reach: 15000,
        impressions: 45000,
        engagement: 3500,
        clicks: 890,
        conversions: 45,
        reportMonth: '2025-06'
      },
      {
        clientId: createdClients[1]?._id,
        campaignName: 'Product Launch',
        platform: 'Instagram',
        reach: 22000,
        impressions: 67000,
        engagement: 5400,
        clicks: 1200,
        conversions: 78,
        reportMonth: '2025-06'
      }
    ];

    for (const analytics of demoAnalytics) {
      try {
        const response = await axios.post(`${API_URL}/analytics`, analytics, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`✅ Created analytics: ${analytics.campaignName}`);
      } catch (error) {
        console.log(`❌ Failed to create analytics`);
      }
    }

    console.log('\n🎉 Demo setup complete!\n');
    console.log('📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 ADMIN LOGIN:');
    console.log('   Email: admin@spoton.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('👨‍💼 MANAGER LOGIN:');
    console.log('   Email: manager@spoton.com');
    console.log('   Password: manager123');
    console.log('');
    console.log('👨‍💻 STAFF LOGIN:');
    console.log('   Email: staff@spoton.com');
    console.log('   Password: staff123');
    console.log('');
    console.log('👤 CLIENT LOGIN:');
    console.log('   Email: client@spoton.com');
    console.log('   Password: client123');
    console.log('');
    console.log('🌐 Application URLs:');
    console.log('   Frontend: http://localhost:5173');
    console.log('   Backend:  http://localhost:5000');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Demo setup failed:', error.message);
  }
}

// Run the setup
setupDemo();
