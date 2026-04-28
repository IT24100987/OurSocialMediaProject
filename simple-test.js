const http = require('http');

// Test if server is running
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  console.log(`✅ Server is running! Status: ${res.statusCode}`);
  console.log('Response:', res.statusMessage);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', data);
  });
});

req.on('error', (err) => {
  console.error('❌ Server not running:', err.message);
  console.log('\nPlease start the backend server with:');
  console.log('  cd backend');
  console.log('  node server.js');
});

req.on('timeout', () => {
  console.error('❌ Server request timed out');
  req.destroy();
});

req.end();
