// Test entry 7 specifically
import fetch from 'node-fetch';

async function testEntry7Quiz() {
  try {
    console.log('=== Testing Entry 7 Quiz Access ===');
    
    // Login as teststudent (studentId: 7)
    console.log('\n1. Logging in as teststudent...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'teststudent@gmail.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} - ${await loginResponse.text()}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    
    // Test quiz for entry 7
    console.log('\n2. Testing quiz for entry 7...');
    const quizResponse = await fetch('http://localhost:5000/api/mcq/entries/7/questions/student', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Quiz response status: ${quizResponse.status}`);
    
    if (quizResponse.ok) {
      const questions = await quizResponse.json();
      console.log(`✅ Found ${questions.length} questions for entry 7`);
      console.log('Questions:', questions);
    } else {
      const errorText = await quizResponse.text();
      console.log(`❌ Error: ${errorText}`);
    }
    
    console.log('\n=== Test Complete ===');
    process.exit(0);
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testEntry7Quiz();
