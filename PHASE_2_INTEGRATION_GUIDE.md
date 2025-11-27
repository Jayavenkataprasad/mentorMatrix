# Phase 2 Integration Guide - Real-time Features

## ✅ What's Been Implemented

### Backend (Phase 2.1 - WebSocket Infrastructure)
- ✅ Socket.IO server setup with authentication
- ✅ User room subscriptions (mentor, student, cohort)
- ✅ Real-time event emitters for all major actions
- ✅ Database schema expanded with 3 new tables
- ✅ Schedules API endpoints (CRUD + status)
- ✅ Server.js updated to use HTTP server with Socket.IO

### Frontend (Phase 2.1 - WebSocket Client)
- ✅ Socket.IO client hook (useSocket)
- ✅ Realtime context for state management
- ✅ Notification Center component
- ✅ Activity Feed component
- ✅ Socket.io-client dependency added

### Database (Phase 2.2 - Schema Expansion)
- ✅ `schedules` table for timetable management
- ✅ `activity_feed` table for event logging
- ✅ `audit_logs` table for change tracking
- ✅ Proper indexes for performance

## 🚀 Next Steps to Complete Phase 2

### Step 1: Install Dependencies
```powershell
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Step 2: Update App.jsx to Use RealtimeProvider

**File: `frontend/src/App.jsx`**

Wrap the app with RealtimeProvider:

```jsx
import { RealtimeProvider } from './context/RealtimeContext.jsx';

export default function App() {
  const { user } = useAuth();

  return (
    <RealtimeProvider userId={user?.id} userRole={user?.role}>
      {/* existing routes */}
    </RealtimeProvider>
  );
}
```

### Step 3: Update Navbar to Include NotificationCenter

**File: `frontend/src/components/Navbar.jsx`**

Add NotificationCenter component:

```jsx
import NotificationCenter from './NotificationCenter.jsx';

// Inside the navbar JSX, add:
<NotificationCenter />
```

### Step 4: Create Schedule Pages

**File: `frontend/src/pages/mentor/Schedules.jsx` (NEW)**

Create a page for mentors to manage schedules:

```jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import { api } from '../api/client.js';

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (data) => {
    try {
      await api.post('/schedules', data);
      fetchSchedules();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (confirm('Delete this schedule?')) {
      try {
        await api.delete(`/schedules/${id}`);
        fetchSchedules();
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Create Schedule
        </button>
      </div>

      {showForm && (
        <ScheduleForm onSubmit={handleCreateSchedule} onCancel={() => setShowForm(false)} />
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {schedules.map(schedule => (
            <div key={schedule.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{schedule.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{schedule.description}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>📅 {new Date(schedule.startTime).toLocaleString()}</span>
                    <span>🎯 {schedule.focusStack}</span>
                    <span className={`px-2 py-1 rounded text-white ${
                      schedule.status === 'completed' ? 'bg-green-600' :
                      schedule.status === 'canceled' ? 'bg-red-600' :
                      'bg-blue-600'
                    }`}>
                      {schedule.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-700">
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScheduleForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    focusStack: '',
    studentId: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-200">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Schedule Title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        />
        <input
          type="datetime-local"
          value={formData.startTime}
          onChange={(e) => setFormData({...formData, startTime: e.target.value})}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="datetime-local"
          value={formData.endTime}
          onChange={(e) => setFormData({...formData, endTime: e.target.value})}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          placeholder="Focus Stack (e.g., React, DSA)"
          value={formData.focusStack}
          onChange={(e) => setFormData({...formData, focusStack: e.target.value})}
          className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create Schedule
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

### Step 5: Create Student Schedule View

**File: `frontend/src/pages/student/MySchedule.jsx` (NEW)**

Create a page for students to view their schedules:

```jsx
import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { api } from '../api/client.js';

export default function MySchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (id) => {
    try {
      await api.patch(`/schedules/${id}/status`, { status: 'completed' });
      fetchSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const upcomingSchedules = schedules.filter(s => s.status === 'scheduled');
  const completedSchedules = schedules.filter(s => s.status === 'completed');

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Schedule</h1>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          {/* Upcoming */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={24} className="text-blue-600" />
              Upcoming Sessions
            </h2>
            <div className="grid gap-4">
              {upcomingSchedules.length === 0 ? (
                <p className="text-gray-600">No upcoming sessions</p>
              ) : (
                upcomingSchedules.map(schedule => (
                  <div key={schedule.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{schedule.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{schedule.description}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          <span>📅 {new Date(schedule.startTime).toLocaleString()}</span>
                          <span>🎯 {schedule.focusStack}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleMarkComplete(schedule.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Mark Complete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Completed */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle size={24} className="text-green-600" />
              Completed Sessions
            </h2>
            <div className="grid gap-4">
              {completedSchedules.length === 0 ? (
                <p className="text-gray-600">No completed sessions</p>
              ) : (
                completedSchedules.map(schedule => (
                  <div key={schedule.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-green-600 opacity-75">
                    <h3 className="font-semibold text-gray-900">{schedule.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{schedule.description}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <span>📅 {new Date(schedule.startTime).toLocaleString()}</span>
                      <span>🎯 {schedule.focusStack}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

### Step 6: Update Routes in App.jsx

Add new routes for schedules:

```jsx
// Mentor routes
<Route path="/mentor/schedules" element={<Schedules />} />

// Student routes
<Route path="/student/schedule" element={<MySchedule />} />
```

### Step 7: Update Navbar Links

Add navigation links to schedules pages in Navbar.jsx.

## 🔌 Real-time Event Flow

### When Student Registers:
1. Backend emits `student:registered` event
2. All mentors receive notification
3. Mentor dashboard updates active students count
4. Notification appears in mentor's notification center

### When Entry is Created:
1. Backend emits `entry:created` event
2. Assigned mentor receives notification
3. Mentor's metrics update in real-time
4. Activity feed shows new entry

### When Entry Status Changes:
1. Backend emits `entry:statusChanged` event
2. Student receives notification
3. Student's dashboard updates entry status
4. Mentor sees status change in their dashboard

### When Schedule is Created:
1. Backend emits `schedule:created` event
2. Student receives notification
3. Student's schedule page updates
4. Both dashboards reflect the new schedule

## 🧪 Testing Real-time Features

### Test 1: Student Registration
1. Open mentor dashboard
2. In another browser/tab, register new student
3. Verify "Active Students" count increases immediately
4. Verify notification appears in mentor's notification center

### Test 2: Entry Creation
1. Login as student
2. Create new entry
3. Check mentor dashboard - entry count should update
4. Verify mentor receives notification

### Test 3: Status Change
1. Login as mentor
2. Review an entry and change status
3. Switch to student tab
4. Verify student sees status change immediately
5. Verify notification appears

### Test 4: Schedule Assignment
1. Login as mentor
2. Create a schedule and assign to student
3. Switch to student tab
4. Verify schedule appears in "My Schedule"
5. Verify notification appears

## 📊 Performance Tips

1. **Debounce Updates**: Batch rapid updates to avoid overwhelming clients
2. **Selective Broadcasting**: Only send updates to relevant users
3. **Caching**: Cache frequently accessed data
4. **Indexes**: Database indexes are already created for performance
5. **Connection Pooling**: Use for production deployments

## 🔐 Security Considerations

1. **Authentication**: All Socket.IO connections require valid JWT
2. **Authorization**: Users only receive updates for data they have access to
3. **Room-based Access**: Users automatically join appropriate rooms
4. **Token Validation**: Tokens are verified on connection

## 📝 API Documentation

### Schedules Endpoints

**Create Schedule**
```
POST /api/schedules
Authorization: Bearer {token}
Content-Type: application/json

{
  "studentId": 2,
  "title": "React Workshop",
  "description": "Learn React Hooks",
  "startTime": "2025-12-01T09:00:00Z",
  "endTime": "2025-12-01T10:00:00Z",
  "focusStack": "React",
  "isGroupSession": false
}
```

**Get Schedules**
```
GET /api/schedules?studentId=2&status=scheduled
Authorization: Bearer {token}
```

**Update Schedule Status**
```
PATCH /api/schedules/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed"
}
```

## 🚀 Deployment Checklist

- [ ] Install Socket.IO dependencies
- [ ] Update database schema
- [ ] Test all real-time events
- [ ] Verify authorization rules
- [ ] Test with multiple users
- [ ] Monitor WebSocket connections
- [ ] Set up error logging
- [ ] Configure CORS for production domain
- [ ] Use sticky sessions if load balanced
- [ ] Consider Redis adapter for scaling

## 📞 Troubleshooting

### WebSocket Connection Issues
- Check browser console for errors
- Verify token is being sent
- Check CORS configuration
- Ensure server is running

### Events Not Received
- Verify user is in correct room
- Check event names match
- Verify authorization rules
- Check browser console for errors

### Performance Issues
- Monitor WebSocket connections
- Check database query performance
- Verify indexes are being used
- Consider caching strategies

---

**Status:** Phase 2.1 Complete ✅
**Next Phase:** Phase 2.3 - Real-time Dashboard Updates
**Estimated Time:** 1-2 weeks for full Phase 2 completion
