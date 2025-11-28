// Test student2 specifically
import fetch from 'node-fetch';

async function testStudent2() {
  try {
    console.log('=== Testing Student2 MCQ Flow ===');
    
    // Step 1: Login as student2
    console.log('\n1. Logging in as student2...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'student2@gmail.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} - ${await loginResponse.text()}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    
    // Step 2: Get student2 entries
    console.log('\n2. Getting student2 entries...');
    const entriesResponse = await fetch('http://localhost:5000/api/entries', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!entriesResponse.ok) {
      throw new Error(`Failed to get entries: ${entriesResponse.status}`);
    }
    
    const entriesData = await entriesResponse.json();
    console.log(`✅ Found ${entriesData.length} entries:`, entriesData.map(e => ({ id: e.id, title: e.title, deadline: e.deadline })));
    
    // Step 3: Test quiz access for each entry
    for (const entry of entriesData) {
      console.log(`\n3. Testing quiz for entry ${entry.id} (${entry.title})...`);
      
      const quizResponse = await fetch(`http://localhost:5000/api/mcq/entries/${entry.id}/questions/student`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Quiz response status: ${quizResponse.status}`);
      
      if (quizResponse.ok) {
        const questionsData = await quizResponse.json();
        console.log(`✅ Found ${questionsData.length} questions for entry ${entry.id}`);
        if (questionsData.length > 0) {
          console.log('Question preview:', questionsData[0]);
        }
      } else {
        const errorText = await quizResponse.text();
        console.log(`❌ No questions for entry ${entry.id}: ${errorText}`);
      }
    }
    
    console.log('\n=== Student2 MCQ Flow Test Complete ===');
    process.exit(0);
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testStudent2();
