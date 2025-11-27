# Testing Guide

## Manual Testing Checklist

### Authentication Tests

#### Student Registration
- [ ] Register with valid credentials
- [ ] Verify email uniqueness validation
- [ ] Verify password hashing
- [ ] Redirect to dashboard after registration
- [ ] Token stored in localStorage

#### Mentor Registration
- [ ] Register as mentor role
- [ ] Verify role-based redirect
- [ ] Check mentor dashboard access

#### Login
- [ ] Login with correct credentials
- [ ] Reject invalid email
- [ ] Reject invalid password
- [ ] Token persists on page refresh
- [ ] Logout clears token

### Student Features Tests

#### Dashboard
- [ ] Display total entries count
- [ ] Display learning streak
- [ ] Show weekly activity chart
- [ ] Display pending tasks
- [ ] Show entry status breakdown

#### Create Entry
- [ ] Create entry with title and body
- [ ] Add multiple tags
- [ ] Add multiple resources (URLs)
- [ ] Validate required fields
- [ ] Redirect to entries list after creation

#### View Entries
- [ ] Display all student's entries
- [ ] Filter by status
- [ ] Filter by tag
- [ ] Pagination works correctly
- [ ] Sort by date (newest first)

#### Entry Detail
- [ ] Display full entry content
- [ ] Show all tags and resources
- [ ] Display mentor feedback/comments
- [ ] Edit entry (title, body, tags, resources)
- [ ] Delete entry with confirmation
- [ ] Update entry status reflects immediately

#### Tasks
- [ ] Display pending tasks
- [ ] Display completed tasks
- [ ] Mark task as complete
- [ ] Mark task as incomplete
- [ ] Show task due date
- [ ] Delete task

### Mentor Features Tests

#### Dashboard
- [ ] Display total entries count
- [ ] Display active students count
- [ ] Show entries by status pie chart
- [ ] Show weekly submissions bar chart
- [ ] Display recent submissions list
- [ ] Click on recent submission navigates to review

#### Students List
- [ ] Display all students
- [ ] Show student name and email
- [ ] Click "View Activity" navigates to student page

#### Student Activity
- [ ] Display student's learning streak
- [ ] Display all student entries
- [ ] Filter by status
- [ ] Click "Review" navigates to entry review

#### Entry Review
- [ ] Display entry details
- [ ] Display all existing comments
- [ ] Add new feedback comment
- [ ] Update entry status
- [ ] Status change reflects immediately
- [ ] Comments display mentor name and timestamp

#### Task Assignment
- [ ] Select student from dropdown
- [ ] Enter task title
- [ ] Enter task description
- [ ] Set due date
- [ ] Create task successfully
- [ ] Redirect to dashboard after creation

### API Tests

#### Authentication Endpoints

**POST /api/auth/register**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'
```

Expected Response:
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "role": "student"
  }
}
```

**POST /api/auth/login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

#### Entries Endpoints

**POST /api/entries** (Create)
```bash
curl -X POST http://localhost:5000/api/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Learned React",
    "body": "Today I learned React hooks",
    "tags": ["React", "JavaScript"],
    "resources": ["https://react.dev"]
  }'
```

**GET /api/entries** (List)
```bash
curl http://localhost:5000/api/entries \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**GET /api/entries/:id** (Detail)
```bash
curl http://localhost:5000/api/entries/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**PUT /api/entries/:id** (Update)
```bash
curl -X PUT http://localhost:5000/api/entries/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Updated Title",
    "body": "Updated body"
  }'
```

**DELETE /api/entries/:id** (Delete)
```bash
curl -X DELETE http://localhost:5000/api/entries/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**PATCH /api/entries/:id/status** (Update Status - Mentor)
```bash
curl -X PATCH http://localhost:5000/api/entries/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MENTOR_TOKEN" \
  -d '{"status": "approved"}'
```

#### Comments Endpoints

**POST /api/entries/:entryId/comments** (Add Comment - Mentor)
```bash
curl -X POST http://localhost:5000/api/entries/1/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MENTOR_TOKEN" \
  -d '{"message": "Great work!"}'
```

**GET /api/entries/:entryId/comments** (Get Comments)
```bash
curl http://localhost:5000/api/entries/1/comments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Tasks Endpoints

**POST /api/tasks** (Create - Mentor)
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MENTOR_TOKEN" \
  -d '{
    "studentId": 1,
    "title": "Complete React Project",
    "description": "Build a todo app",
    "dueDate": "2025-12-31T23:59:59Z"
  }'
```

**GET /api/tasks** (List)
```bash
curl http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**PUT /api/tasks/:id** (Update)
```bash
curl -X PUT http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"completed": true}'
```

#### Mentor Endpoints

**GET /api/mentor/students** (Get Students - Mentor)
```bash
curl http://localhost:5000/api/mentor/students \
  -H "Authorization: Bearer MENTOR_TOKEN"
```

**GET /api/mentor/analytics** (Get Analytics - Mentor)
```bash
curl http://localhost:5000/api/mentor/analytics \
  -H "Authorization: Bearer MENTOR_TOKEN"
```

**GET /api/mentor/student/:studentId/streak** (Get Streak - Mentor)
```bash
curl http://localhost:5000/api/mentor/student/1/streak \
  -H "Authorization: Bearer MENTOR_TOKEN"
```

### Edge Cases & Error Handling

#### Authentication Errors
- [ ] Missing token returns 401
- [ ] Invalid token returns 403
- [ ] Expired token returns 403
- [ ] Wrong role returns 403

#### Validation Errors
- [ ] Missing required fields returns 400
- [ ] Invalid email format returns 400
- [ ] Duplicate email returns 400
- [ ] Invalid status value returns 400

#### Authorization Errors
- [ ] Student cannot update other student's entry
- [ ] Student cannot delete other student's entry
- [ ] Mentor cannot create entry
- [ ] Mentor cannot delete task they didn't create

#### Not Found Errors
- [ ] Non-existent entry returns 404
- [ ] Non-existent task returns 404
- [ ] Non-existent student returns 404

### Performance Tests

#### Load Testing
```bash
# Install Apache Bench
# ab -n 1000 -c 10 http://localhost:3000/

# Or use wrk
# wrk -t4 -c100 -d30s http://localhost:3000/
```

#### Database Query Performance
- [ ] Entries list loads in < 500ms
- [ ] Dashboard loads in < 1s
- [ ] Analytics loads in < 2s

#### Frontend Performance
- [ ] Page load time < 3s
- [ ] Time to interactive < 2s
- [ ] Lighthouse score > 80

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

### Responsive Design

- [ ] Mobile (320px)
- [ ] Tablet (768px)
- [ ] Desktop (1024px+)
- [ ] Large screens (1920px+)

## Automated Testing (Optional)

### Unit Tests Example

```javascript
// tests/auth.test.js
import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';

describe('Authentication', () => {
  it('should hash password correctly', async () => {
    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);
    const isValid = await bcrypt.compare(password, hash);
    expect(isValid).toBe(true);
  });

  it('should reject invalid password', async () => {
    const hash = await bcrypt.hash('password123', 10);
    const isValid = await bcrypt.compare('wrongpassword', hash);
    expect(isValid).toBe(false);
  });
});
```

### Integration Tests Example

```javascript
// tests/entries.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

describe('Entries API', () => {
  let token;
  let entryId;

  beforeAll(async () => {
    // Login and get token
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'student@example.com',
      password: 'password123'
    });
    token = response.data.token;
  });

  it('should create entry', async () => {
    const response = await axios.post(
      'http://localhost:5000/api/entries',
      {
        title: 'Test Entry',
        body: 'Test body',
        tags: ['test'],
        resources: []
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    expect(response.status).toBe(201);
    entryId = response.data.id;
  });

  it('should get entry', async () => {
    const response = await axios.get(
      `http://localhost:5000/api/entries/${entryId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    expect(response.status).toBe(200);
    expect(response.data.title).toBe('Test Entry');
  });
});
```

## Test Report Template

```
Date: YYYY-MM-DD
Tester: Name
Build Version: X.X.X

PASSED: XX tests
FAILED: X tests
SKIPPED: X tests

Issues Found:
1. [Issue Description] - Severity: High/Medium/Low

Recommendations:
- 
```

## Continuous Testing

- Run tests on every commit
- Generate coverage reports
- Monitor error rates in production
- Regular security scans
- Performance monitoring
