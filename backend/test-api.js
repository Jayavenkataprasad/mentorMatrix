// Test the student API endpoint directly
import fetch from 'node-fetch';

async function testStudentAPI() {
  try {
    console.log('Testing student API endpoint...');
    
    // First, login as student to get token
    const loginResponse = await fetch('https://mentormatrix.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'student2@gmail.com',
        password: 'password123' // Use student2 with updated password
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} - ${await loginResponse.text()}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful, got token');
    
    // Now test the questions endpoint
    const questionsResponse = await fetch('https://mentormatrix.onrender.com/api/mcq/entries/3/questions/student', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Questions response status: ${questionsResponse.status}`);
    
    if (!questionsResponse.ok) {
      const errorData = await questionsResponse.text();
      console.log('Error response:', errorData);
    } else {
      const questionsData = await questionsResponse.json();
      console.log('Questions data:', questionsData);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testStudentAPI();
