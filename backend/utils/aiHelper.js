// 💡 Beginner Note: This function allows our app to talk to Google's Gemini AI.
// We pass a 'prompt' (question or instruction), send it to their API, and wait for a response.
const callClaude = async (prompt, originalPrompt = null) => {
  try {
    console.log('🚀 Calling Google Gemini API...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('❌ API Error:', data.error?.message || response.statusText);
      // Check for API key or quota issues
      if (data.error?.message?.includes('API key') || data.error?.message?.includes('quota') || data.error?.message?.includes('billing')) {
        console.log('💳 API issue - using demo responses');
        return getDemoResponse(originalPrompt || prompt);
      }
      throw new Error(`Google Gemini API Error: ${data.error?.message || response.statusText}`);
    }

    console.log('✅ Successful API response');
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.log('❌ API Error:', error.message);
    console.log('🔄 Using demo responses as fallback');
    // Return demo response on any error for demonstration
    return getDemoResponse(originalPrompt || prompt);
  }
};

// Demo response function for demonstration purposes
const getDemoResponse = (prompt) => {
  console.log('🤖 AI Demo Prompt:', prompt); // Debug log
  const lowerPrompt = prompt.toLowerCase();
  
  // Sentiment analysis (for feedback analysis) - be more specific
  if (lowerPrompt.includes('feedback') && (lowerPrompt.includes('sentiment') || lowerPrompt.includes('rating'))) {
    return JSON.stringify({
      sentiment: "positive",
      suggestions: "Continue providing excellent customer service and maintain the current quality standards. Consider implementing a loyalty program to retain satisfied customers."
    });
  }
  
  // Client management questions
  if (lowerPrompt.includes('client management') || lowerPrompt.includes('client')) {
    return "SpotOn CMS Client Management helps you efficiently manage your client relationships:\n\n🏢 Client Profiles:\n• Complete client information with contact details\n• Company information and billing addresses\n• Package subscription management (Silver, Gold, Platinum, Diamond)\n• Status tracking (Active/Inactive)\n\n📦 Package Management:\n• Silver: Basic features with limited support\n• Gold: Advanced features with priority support\n• Platinum: Premium features with dedicated support\n• Diamond: Full enterprise features with VIP support\n\n🔧 Management Features:\n• Add/edit/delete client records\n• Search and filter clients by name or company\n• Track client status and package upgrades\n• View client task history and payments\n\nWould you like to know more about a specific aspect of client management?";
  }
  
  // Task management questions
  if (lowerPrompt.includes('task management') || lowerPrompt.includes('task')) {
    return "SpotOn CMS Task Management provides comprehensive task tracking and collaboration features:\n\n📋 Task Creation & Assignment:\n• Create tasks with detailed descriptions and requirements\n• Assign tasks to team members (Admin, Manager, Staff)\n• Set priority levels: High, Medium, Low\n• Define due dates and deadline tracking\n• Link tasks to specific clients or projects\n\n📅 Calendar Integration:\n• Visual calendar view of all tasks and deadlines\n• Monthly and weekly task planning\n• Drag-and-drop task rescheduling\n• Color-coded priority indicators\n• Overdue task highlighting\n\n📊 Task Tracking:\n• Real-time status updates (Pending, In Progress, Completed)\n• Task progress monitoring and completion rates\n• Team workload distribution\n• Performance analytics and reporting\n\n🔔 Notifications & Reminders:\n• Automated deadline reminders\n• Status change notifications\n• Task assignment alerts\n• Daily task summaries\n\nWould you like to know more about specific task management features?";
  }
  
  // SpotOn CMS specific questions
  if (lowerPrompt.includes('what is the spoton cms') || lowerPrompt.includes('what is spoton cms') || 
      lowerPrompt.includes('complete information') || lowerPrompt.includes('complete') || 
      lowerPrompt.includes('overview') || lowerPrompt.includes('about') || lowerPrompt.includes('tell me')) {
    return "SpotOn CMS is an Intelligent Content Management System designed for modern businesses. It features:\n\n🏢 Multi-Role System: Admin, Manager, Staff, and Client roles with specific permissions\n👥 Client Management: Complete client profiles with package tiers (Silver, Gold, Platinum, Diamond)\n📋 Task Management: Create, assign, and track tasks with calendar view and priority levels\n💳 Payment Dashboard: Monitor transactions and financial analytics\n🤖 AI-Powered Insights: Get intelligent business recommendations and sentiment analysis\n📊 Analytics Dashboard: Track business metrics and performance indicators\n🔄 Feedback System: Collect and analyze client feedback with sentiment tracking\n\nIt's your all-in-one solution for managing clients, tasks, payments, and business growth!";
  }
  
  // Help requests
  if (lowerPrompt.includes('help') || lowerPrompt.includes('need help') || lowerPrompt.includes('guide me')) {
    return "I'm here to help you with SpotOn CMS! I can assist you with:\n\n🏢 Client Management: Adding clients, managing packages, tracking status\n📋 Task Operations: Creating tasks, assigning to staff, calendar management\n👥 User Roles: Understanding Admin, Manager, Staff, and Client permissions\n💳 Payment Tracking: Monitoring client payments and financial data\n📊 Analytics: Understanding business insights and performance metrics\n🤖 AI Features: Sentiment analysis and business recommendations\n🔧 System Navigation: Finding features and understanding workflows\n\nWhat specific area of SpotOn CMS would you like help with?";
  }
  
  // Greetings
  if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
    return "Hello! Welcome to SpotOn CMS! I'm your AI assistant here to help you navigate our intelligent management system. Whether you need help with client management, task tracking, payments, or analytics - I'm here to guide you. What would you like to explore today?";
  }
  
  // Features question
  if (lowerPrompt.includes('features') || lowerPrompt.includes('what can you do')) {
    return "SpotOn CMS offers powerful features for business management:\n\n🎯 Core Features:\n• Multi-user role system (Admin, Manager, Staff, Client)\n• Complete client management with package tiers\n• Advanced task management with calendar integration\n• Payment processing and financial tracking\n• Real-time analytics and reporting\n\n🤖 AI-Powered Features:\n• Intelligent sentiment analysis on client feedback\n• Automated business insights and recommendations\n• Smart role suggestions for new users\n• Trend analysis and pattern recognition\n\n🔧 User Features:\n• Interactive task calendar with deadline tracking\n• Comprehensive feedback system\n• Customizable dashboards for each role\n• Professional notification system\n\nWhich feature would you like to know more about?";
  }
  
  // Role questions
  if (lowerPrompt.includes('admin') || lowerPrompt.includes('manager') || lowerPrompt.includes('staff') || lowerPrompt.includes('client') || 
      lowerPrompt.includes('user roles') || lowerPrompt.includes('roles') || lowerPrompt.includes('management') || 
      lowerPrompt.includes('managements') || lowerPrompt.includes('managementd')) {
    return "SpotOn CMS has four distinct user roles with specific permissions:\n\n🔑 Admin: Complete system access including user management, package configuration, and all client/task management\n\n👔 Manager: Client management, task assignment, payment oversight, and team coordination\n\n🛠️ Staff: Task management, calendar access, and assigned task tracking\n\n👤 Client: Personal dashboard, feedback submission, analytics viewing, and task tracking\n\nEach role has tailored permissions and features to ensure efficient workflow management. Admins have full control, Managers oversee operations, Staff handle daily tasks, and Clients have limited access to their own information.\n\nWhat role would you like to know more about?";
  }
  
  // Default response
  return "I'm your SpotOn CMS AI assistant! I can help you understand and navigate our intelligent management system. Feel free to ask me about client management, task tracking, user roles, payments, analytics, or any other feature of SpotOn CMS. How can I assist you today?";
};

module.exports = { callClaude, getDemoResponse };
