// Test if frontend is accessible
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5174,
  path: '/',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  console.log(`✅ Frontend server responding! Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (data.includes('SpotOn CMS') || data.includes('html')) {
      console.log('✅ HTML content is being served');
    } else {
      console.log('❌ Unexpected content:', data.substring(0, 200));
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Frontend server error:', err.message);
});

req.on('timeout', () => {
  console.error('❌ Frontend server request timed out');
  req.destroy();
});

req.end();
