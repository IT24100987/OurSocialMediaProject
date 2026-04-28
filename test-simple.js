// Simple test with fetch
async function testSimple() {
  try {
    console.log('Testing fetch...');
    
    const response = await fetch('http://localhost:5000/');
    const text = await response.text();
    console.log('Response:', text);
    
  } catch (error) {
    console.log('Fetch failed:', error.message);
  }
}

testSimple();
