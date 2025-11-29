const http = require('http');

// Test the MCQ API endpoint
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/mcq/entries/3/questions/student',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token' // This will fail but we can see if server is running
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Response Body: ${data}`);
  });
});

req.on('error', (error) => {
  console.error(`Error: ${error.message}`);
  console.log('Backend server is not running or not accessible');
});

req.end();
