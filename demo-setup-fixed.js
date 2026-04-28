const axios = require('axios');

// API Configuration
const API_URL = 'http://localhost:5000/api';

// Demo users
const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@spoton.com',
    password: 'admin123',
    role: 'Admin'
  },
  {
    name: 'Manager User',
    email: 'manager@spoton.com',
    password: 'manager123',
    role: 'Manager'
  },
  {
    name: 'Staff User',
    email: 'staff@spoton.com',
    password: 'staff123',
    role: 'Staff'
  },
  {
    name: 'Client User',
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
    notes: 'Organic products retailer'
  }
];

// Demo feedback
const demoFeedback = [
  {
    campaignName: 'Summer Sale 2024',
    rating: 5,
    text: 'Amazing campaign! Our sales increased by 40% and customer engagement was excellent.',
    date: new Date('2024-06-15')
  },
  {
    campaignName: 'Product Launch Q1',
    rating: 4,
    text: 'Good results overall, but we need better targeting for the next launch.',
    date: new Date('2024-03-20')
  },
  {
    campaignName: 'Holiday Special',
    rating: 5,
    text: 'Outstanding performance! The AI insights really helped optimize our ad spend.',
    date: new Date('2023-12-10')
  }
];

// Demo tasks
const demoTasks = [
  {
    title: 'Review Q2 Campaign Performance',
    description: 'Analyze campaign metrics and prepare report',
    priority: 'High',
    status: 'Pending',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: 'Client Onboarding Call',
    description: 'Schedule onboarding call for new client',
    priority: 'Medium',
    status: 'In Progress',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: 'AI Insights Report',
    description: 'Generate monthly AI analytics report',
    priority: 'Low',
    status: 'Pending',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Demo analytics
const demoAnalytics = [
  {
    campaignName: 'Summer Sale 2024',
    reach: 15000,
    engagement: 3200,
    conversions: 480,
    revenue: 48500,
    date: new Date('2024-06-30')
  },
  {
    campaignName: 'Product Launch Q1',
    reach: 12000,
    engagement: 2800,
    conversions: 350,
    revenue: 42000,
    date: new Date('2024-03-31')
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
    const adminTokenForTasks = createdUsers.find(u => u.role === 'Admin')?.token;
    
    if (!adminTokenForTasks || !staffUser) {
      console.log('❌ No admin token or staff user found, skipping task creation');
    } else {
      for (const task of demoTasks) {
        try {
          const taskData = {
            ...task,
            assignedTo: staffUser._id,
            clientId: createdClients[0]?._id
          };
          
          const response = await axios.post(`${API_URL}/tasks`, taskData, {
            headers: { Authorization: `Bearer ${adminTokenForTasks}` }
          });
          console.log(`✅ Created task: ${task.title}`);
        } catch (error) {
          console.log(`❌ Failed to create task: ${task.title}`);
          console.log(`   Error: ${error.response?.data?.message || error.message}`);
        }
      }
    }

    // 5. Create demo analytics
    console.log('\n5. Creating demo analytics...');
    if (!adminTokenForTasks) {
      console.log('❌ No admin token found, skipping analytics creation');
    } else {
      for (const analytics of demoAnalytics) {
        try {
          const analyticsData = {
            ...analytics,
            clientId: createdClients[0]?._id
          };
          
          const response = await axios.post(`${API_URL}/analytics`, analyticsData, {
            headers: { Authorization: `Bearer ${adminTokenForTasks}` }
          });
          console.log(`✅ Created analytics: ${analytics.campaignName}`);
        } catch (error) {
          console.log(`❌ Failed to create analytics`);
          console.log(`   Error: ${error.response?.data?.message || error.message}`);
        }
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
