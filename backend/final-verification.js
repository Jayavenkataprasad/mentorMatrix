// Final verification of the complete MCQ system
import fetch from 'node-fetch';

async function testUser(email, password, userName) {
  console.log(`\n=== Testing ${userName} ===`);
  
  try {
    // Login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!loginResponse.ok) {
      console.log(`❌ Login failed: ${loginResponse.status}`);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log(`✅ ${userName} logged in successfully`);
    
    // Get entries
    const entriesResponse = await fetch('http://localhost:5000/api/entries', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!entriesResponse.ok) {
      console.log(`❌ Failed to get entries: ${entriesResponse.status}`);
      return;
    }
    
    const entries = await entriesResponse.json();
    console.log(`✅ Found ${entries.length} entries for ${userName}`);
    
    // Test each entry
    for (const entry of entries) {
      console.log(`\n  Testing Entry ${entry.id}: "${entry.title}"`);
      
      const deadlineStatus = entry.deadline ? 
        (new Date(entry.deadline) <= new Date() ? '✅ PASSED' : '❌ NOT PASSED') : 
        '❌ NO DEADLINE';
      console.log(`    Deadline: ${deadlineStatus}`);
      
      if (entry.deadline && new Date(entry.deadline) <= new Date()) {
        // Try to get questions
        const quizResponse = await fetch(`http://localhost:5000/api/mcq/entries/${entry.id}/questions/student`, {
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`    Quiz API Status: ${quizResponse.status}`);
        
        if (quizResponse.ok) {
          const questions = await quizResponse.json();
          console.log(`    ✅ Found ${questions.length} questions`);
          if (questions.length > 0) {
            console.log(`    Question: "${questions[0].question}"`);
            console.log(`    Options: ${questions[0].options.join(', ')}`);
          }
        } else {
          const error = await quizResponse.text();
          console.log(`    ❌ Error: ${error}`);
        }
      } else {
        console.log(`    ⏸️ Quiz not available yet (deadline not passed)`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Error testing ${userName}:`, error.message);
  }
}

async function runAllTests() {
  console.log('=== Final MCQ System Verification ===');
  
  // Test all students
  await testUser('student2@gmail.com', 'password123', 'Student2');
  await testUser('teststudent@gmail.com', 'password123', 'TestStudent');
  
  console.log('\n=== Verification Complete ===');
  console.log('\n📋 Summary:');
  console.log('- Student2 should see 1 entry with 1 question');
  console.log('- TestStudent should see 2 entries with questions');
  console.log('- All deadlines have passed');
  console.log('- All questions should be accessible');
  
  process.exit(0);
}

runAllTests().catch(console.error);
