# MentorMatrix - Troubleshooting Guide

This document contains common errors encountered during the development and usage of the MentorMatrix application, along with their solutions.

## Table of Contents
1. [Doubt Creation Issues](#doubt-creation-issues)
2. [Mentor Portal Display Issues](#mentor-portal-display-issues)
3. [Quiz Analytics Filtering Issues](#quiz-analytics-filtering-issues)
4. [JSX Syntax Errors](#jsx-syntax-errors)
5. [API Integration Issues](#api-integration-issues)

---

## Doubt Creation Issues

### Error: "Failed to load resource: the server responded with a status of 400 ()"
**Component:** Student Portal - Doubts Tab  
**File:** `frontend/src/pages/student/DoubtsEnhanced.jsx`

**Problem:** Students could create doubts, but they failed with a 400 error.

**Root Cause:** Backend API required both `concept` and `question` fields, but the frontend form was missing the `concept` input field.

**Solution:**
```jsx
// Add concept input field in the form (lines 265-278)
{/* Concept Input */}
<div>
  <label className="block text-sm font-semibold text-purple-200 mb-3">
    Concept/Topic
  </label>
  <input
    type="text"
    placeholder="e.g., React Hooks, Database Normalization, API Design"
    value={formData.concept}
    onChange={(e) => setFormData({...formData, concept: e.target.value})}
    className="w-full px-4 py-3 bg-purple-900/50 border-2 border-purple-600/50 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 transition-colors"
    required
  />
</div>
```

**Files Modified:**
- `frontend/src/pages/student/DoubtsEnhanced.jsx`

---

## Mentor Portal Display Issues

### Error: Doubts not appearing in mentor portal
**Component:** Mentor Portal - Doubts Section  
**File:** `backend/routes/doubts.js`

**Problem:** Students could create doubts successfully, but mentors couldn't see them in their portal.

**Root Cause:** The backend API query for mentors was incorrectly filtering doubts. It was only showing doubts assigned to the specific mentor OR unassigned doubts, but the logic was flawed.

**Solution:**
```javascript
// Before (line 77):
query += ' AND (d.mentorId = ? OR d.mentorId IS NULL)';
params.push(userId);

// After (line 77):
query += ' AND (d.mentorId IS NULL)';
```

**Files Modified:**
- `backend/routes/doubts.js`

**Additional Enhancement:** Added navigation buttons to mentor dashboard for easier access to doubts:
```jsx
// Added in Quick Actions section
<button
  onClick={() => navigate('/mentor/doubts')}
  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl p-6 transition-colors group"
>
  <MessageCircle className="mb-3 group-hover:scale-110 transition-transform" size={24} />
  <p className="font-semibold">Student Doubts</p>
  <p className="text-sm opacity-80">Answer student questions</p>
</button>
```

**Files Modified:**
- `frontend/src/pages/mentor/Dashboard.jsx`

---

## Quiz Analytics Filtering Issues

### Error: Dropdown not filtering quiz analytics by student
**Component:** Mentor Dashboard - Quiz Analytics  
**File:** `frontend/src/pages/mentor/Dashboard.jsx`

**Problem:** The "All Students" dropdown in quiz analytics wasn't updating the data based on the selected student.

**Root Cause:** Type mismatch in the dropdown value comparison. `e.target.value` returns a string, but `student.id` was being compared directly without string conversion.

**Solution:**
```jsx
// Before (lines 192-204):
<select
  value={selectedStudent ? selectedStudent.id : ''}
  onChange={(e) => {
    const student = students.find(s => s.id === e.target.value);
    setSelectedStudent(student || null);
  }}
>
  <option value="">All Students</option>
  {students.map(student => (
    <option key={student.id} value={student.id}>
      {student.name}
    </option>
  ))}
</select>

// After (lines 192-204):
<select
  value={selectedStudent ? selectedStudent.id.toString() : ''}
  onChange={(e) => {
    const student = students.find(s => s.id.toString() === e.target.value);
    setSelectedStudent(student || null);
  }}
>
  <option value="">All Students</option>
  {students.map(student => (
    <option key={student.id} value={student.id.toString()}>
      {student.name}
    </option>
  ))}
</select>
```

**Files Modified:**
- `frontend/src/pages/mentor/Dashboard.jsx`

---

## JSX Syntax Errors

### Error: Multiple JSX syntax errors in Doubts.jsx
**Component:** Student Portal - Basic Doubts Page  
**File:** `frontend/src/pages/student/Doubts.jsx`

**Problem:** Multiple lint errors including:
- Unexpected token errors
- JSX fragment has no corresponding closing tag
- Missing closing tags

**Root Cause:** Missing closing div tags and inconsistent JSX structure.

**Solutions:**

1. **Fixed text color consistency:**
```jsx
// Changed gray colors to purple theme for dark background
<p className="text-purple-200 mt-2">Ask questions and get clarification from your mentor</p>
<p className="text-purple-200 mt-4">Loading doubts...</p>
<p className="text-purple-200 text-lg">No doubts yet. Ask your first doubt!</p>
```

2. **Fixed hover scale typo:**
```jsx
// Before:
className="...transform hover:scale-102"
// After:
className="...transform hover:scale-105"
```

3. **Fixed JSX structure:**
```jsx
// Added missing closing div tag
)}
</div>  // This was missing
</>
```

**Files Modified:**
- `frontend/src/pages/student/Doubts.jsx`

---

## Student Portal Doubt Display Issues

### Error: Mentor's answers not displaying in student portal
**Component:** Student Portal - Doubts Section  
**Files:** `frontend/src/pages/student/Doubts.jsx`, `frontend/src/pages/student/DoubtsEnhanced.jsx`

**Problem:** Students could see that doubts were answered, but the mentor's answers were not displaying in the modal.

**Root Cause:** When clicking on a doubt to view details, the frontend was only using the basic doubt data from the list view, which doesn't include the answers. The detailed doubt data with answers needed to be fetched separately.

**Solution:**
```jsx
// Add function to fetch detailed doubt data
const handleSelectDoubt = async (doubt) => {
  try {
    setLoadingDoubtDetail(true);
    // Fetch detailed doubt data including answers
    const response = await api.get(`/doubts/${doubt.id}`);
    setSelectedDoubt(response.data);
  } catch (error) {
    console.error('Error fetching doubt details:', error);
    // Fallback to basic data if detailed fetch fails
    setSelectedDoubt(doubt);
  } finally {
    setLoadingDoubtDetail(false);
  }
};

// Update onClick handler
onClick={() => handleSelectDoubt(doubt)}
```

**Files Modified:**
- `frontend/src/pages/student/Doubts.jsx`
- `frontend/src/pages/student/DoubtsEnhanced.jsx`

### Error: "Needs More Explanation" button shows "Failed to update doubt"
**Component:** Student Portal - Doubts Modal  
**File:** `backend/routes/doubts.js`

**Problem:** The `/needs-more` API endpoint didn't exist in the backend, causing the button to fail.

**Root Cause:** Frontend was trying to call `PATCH /doubts/:id/needs-more` but the backend route wasn't implemented.

**Solution:**
```javascript
// Add missing backend endpoint
router.patch('/:id/needs-more', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    // Verify doubt belongs to student
    const doubt = await getAsync('SELECT * FROM doubts WHERE id = ? AND studentId = ?', [id, studentId]);
    if (!doubt) {
      return res.status(404).json({ error: 'Doubt not found or unauthorized' });
    }

    // Only allow "needs more explanation" if doubt is answered
    if (doubt.status !== 'answered') {
      return res.status(400).json({ error: 'Can only request more explanation for answered doubts' });
    }

    // Update doubt status
    const result = await runAsync('UPDATE doubts SET status = ? WHERE id = ?', ['needs_more_explanation', id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Doubt not found' });
    }

    const updatedDoubt = await getAsync('SELECT * FROM doubts WHERE id = ?', [id]);

    // Emit real-time event to mentors and the student
    emitDoubtAnsweredToMentorsAndStudent(
      updatedDoubt,
      null, // no new answer, just status change
      studentId
    );

    res.json(updatedDoubt);
  } catch (error) {
    console.error('Error marking doubt as needing more explanation:', error);
    res.status(500).json({ error: 'Failed to update doubt' });
  }
});
```

**Files Modified:**
- `backend/routes/doubts.js`

**Additional Enhancement:** Added loading state for better UX:
```jsx
const [loadingDoubtDetail, setLoadingDoubtDetail] = useState(false);

// In modal:
{loadingDoubtDetail ? (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p className="text-gray-500 mt-2">Loading doubt details...</p>
    </div>
  </div>
) : (
  // Modal content
)}
```

---

## API Integration Issues

### Error: Missing required fields in API requests
**Component:** Various components making API calls

**Problem:** API calls failing due to missing required fields or incorrect data formats.

**Common Solutions:**

1. **Ensure all required fields are included:**
```javascript
// Backend expects these fields for doubt creation:
const { 
  concept, 
  question, 
  description, 
  taskId, 
  doubtType, 
  subject, 
  techStack, 
  projectName, 
  priority 
} = req.body;
```

2. **Check data types in comparisons:**
```javascript
// Always convert to string when comparing with form values
const student = students.find(s => s.id.toString() === e.target.value);
```

3. **Use proper error handling:**
```javascript
try {
  await api.post('/doubts', formData);
  // Handle success
} catch (error) {
  console.error('Error creating doubt:', error);
  alert('Failed to create doubt');
}
```

---

## General Best Practices

### 1. Consistent Styling
- Use theme-appropriate colors (purple/indigo for dark backgrounds)
- Maintain consistent hover effects and transitions
- Use semantic color coding (green for success, red for errors, yellow for warnings)

### 2. Form Validation
- Always include `required` attribute for mandatory fields
- Provide clear placeholder text to guide users
- Implement proper error states and user feedback

### 3. API Integration
- Handle both success and error cases
- Provide loading states for better UX
- Use proper data type conversions when comparing values

### 4. JSX Structure
- Ensure all opening tags have corresponding closing tags
- Use proper nesting of components
- Maintain consistent indentation for readability

### 5. Navigation and UX
- Provide clear navigation paths to important features
- Add visual feedback for interactive elements
- Implement proper state management for dynamic content

---

## Quick Reference

| Error Type | Common Cause | Quick Fix |
|------------|--------------|-----------|
| 400 Bad Request | Missing required fields | Check API requirements, add missing fields |
| Data not displaying | Incorrect API filtering | Review query logic, fix comparison operators |
| Dropdown not working | Type mismatch | Use `.toString()` for ID comparisons |
| JSX syntax errors | Missing closing tags | Add proper closing tags, check nesting |
| Styling issues | Inconsistent color scheme | Use theme-appropriate colors |

---

## Development Tips

1. **Always check the browser console** for JavaScript errors
2. **Use the Network tab** to inspect API requests and responses
3. **Test with different user roles** to ensure proper authorization
4. **Verify database schema** matches API expectations
5. **Use React DevTools** to debug component state and props

---

*Last Updated: November 29, 2025*  
*Version: 1.0*
