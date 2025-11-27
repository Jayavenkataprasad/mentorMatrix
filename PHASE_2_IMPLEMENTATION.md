# Phase 2: Real-time Features Implementation Plan

## Overview
Enhance the Student Mentoring Portal with real-time dashboard updates, day schedules, and live notifications using WebSockets (Socket.IO).

## 🎯 Implementation Phases

### Phase 2.1: WebSocket Infrastructure (Week 1)
- [ ] Add Socket.IO to backend
- [ ] Implement real-time event emitters
- [ ] Create real-time listeners on frontend
- [ ] Test basic connectivity

### Phase 2.2: Database Schema Expansion (Week 1)
- [ ] Add schedules table
- [ ] Add activity_feed table
- [ ] Add audit fields to entries/tasks
- [ ] Create indexes for performance

### Phase 2.3: Real-time Dashboard Updates (Week 2)
- [ ] Auto-update active students count
- [ ] Live entry count updates
- [ ] Status breakdown live updates
- [ ] Recent activity feed

### Phase 2.4: Day Schedule Feature (Week 2-3)
- [ ] Create schedule management API
- [ ] Build schedule UI components
- [ ] Implement schedule assignment
- [ ] Add attendance/completion marking

### Phase 2.5: Notifications & Activity (Week 3)
- [ ] Implement in-app notifications
- [ ] Create activity feed
- [ ] Add notification center
- [ ] Implement unread counts

## 📋 Detailed Implementation Steps

### Step 1: Backend - Add Socket.IO

**File: `backend/package.json`**
Add dependency:
```json
"socket.io": "^4.7.2"
```

**File: `backend/socket.js` (NEW)**
Create WebSocket event handlers and room management.

**File: `backend/server.js`**
Integrate Socket.IO with Express server.

### Step 2: Database Schema Updates

**File: `backend/db.js`**
Add new tables:
- `schedules` - Time-slotted classes/sessions
- `activity_feed` - Event log for real-time updates
- `audit_logs` - Track changes to entries/tasks

### Step 3: Real-time Event Emitters

**File: `backend/events.js` (NEW)**
Create event emitter functions:
- `emitStudentRegistered(student)`
- `emitEntryCreated(entry)`
- `emitEntryStatusChanged(entry)`
- `emitCommentAdded(comment)`
- `emitTaskAssigned(task)`
- `emitScheduleCreated(schedule)`

### Step 4: Frontend - Socket.IO Client

**File: `frontend/src/hooks/useSocket.js` (NEW)**
Custom hook for Socket.IO connection and event listeners.

**File: `frontend/src/context/RealtimeContext.jsx` (NEW)**
Context for managing real-time state updates.

### Step 5: UI Components for Schedules

**File: `frontend/src/pages/mentor/Schedules.jsx` (NEW)**
Mentor schedule management page.

**File: `frontend/src/pages/student/MySchedule.jsx` (NEW)**
Student schedule view page.

**File: `frontend/src/components/ScheduleCard.jsx` (NEW)**
Reusable schedule card component.

### Step 6: Notifications & Activity Feed

**File: `frontend/src/components/NotificationCenter.jsx` (NEW)**
In-app notification panel.

**File: `frontend/src/components/ActivityFeed.jsx` (NEW)**
Real-time activity feed component.

## 🗄️ Database Schema Changes

### New Table: schedules
```sql
CREATE TABLE schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mentorId INTEGER NOT NULL,
  studentId INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  startTime DATETIME NOT NULL,
  endTime DATETIME NOT NULL,
  focusStack TEXT,
  status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'canceled')),
  isGroupSession BOOLEAN DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mentorId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
);
```

### New Table: activity_feed
```sql
CREATE TABLE activity_feed (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  eventType TEXT NOT NULL,
  actorId INTEGER NOT NULL,
  targetId INTEGER,
  targetType TEXT,
  payload TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actorId) REFERENCES users(id) ON DELETE CASCADE
);
```

### New Table: audit_logs
```sql
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entityType TEXT NOT NULL,
  entityId INTEGER NOT NULL,
  action TEXT NOT NULL,
  changedBy INTEGER NOT NULL,
  oldValue TEXT,
  newValue TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (changedBy) REFERENCES users(id) ON DELETE CASCADE
);
```

### Updated: entries table
Add audit fields:
```sql
ALTER TABLE entries ADD COLUMN reviewedBy INTEGER;
ALTER TABLE entries ADD COLUMN reviewedAt DATETIME;
ALTER TABLE entries ADD COLUMN history TEXT;
```

## 🔌 WebSocket Events

### Mentor Events
```javascript
// Emitted by server
socket.emit('student:registered', { student, mentorId })
socket.emit('entry:created', { entry, studentId })
socket.emit('entry:statusChanged', { entryId, status, studentId })
socket.emit('comment:added', { comment, entryId })
socket.emit('task:assigned', { task })
socket.emit('schedule:created', { schedule })
socket.emit('metrics:updated', { mentorId, metrics })

// Listened by client
socket.on('student:registered', handleNewStudent)
socket.on('entry:created', handleNewEntry)
socket.on('entry:statusChanged', handleStatusChange)
```

### Student Events
```javascript
// Emitted by server
socket.emit('entry:statusChanged', { entryId, status })
socket.emit('comment:added', { comment, entryId })
socket.emit('task:assigned', { task })
socket.emit('schedule:assigned', { schedule })
socket.emit('schedule:updated', { schedule })

// Listened by client
socket.on('entry:statusChanged', handleStatusChange)
socket.on('comment:added', handleNewFeedback)
socket.on('task:assigned', handleNewTask)
socket.on('schedule:assigned', handleScheduleAssignment)
```

## 📊 API Endpoints (New)

### Schedules
```
POST /api/schedules - Create schedule
GET /api/schedules - List schedules
GET /api/schedules/:id - Get schedule
PUT /api/schedules/:id - Update schedule
DELETE /api/schedules/:id - Delete schedule
PATCH /api/schedules/:id/status - Update status
GET /api/schedules?studentId=X&date=YYYY-MM-DD - Filter schedules
```

### Activity Feed
```
GET /api/activity-feed - Get activity feed
GET /api/activity-feed?type=entry:created - Filter by type
```

### Audit Logs
```
GET /api/audit-logs/:entityType/:entityId - Get entity history
```

## 🎨 UI/UX Changes

### Mentor Dashboard Enhancements
- Active Students tile with live counter
- Entries summary (Total/Approved/Pending) with badges
- Recent activity feed with timestamps
- Schedule manager with time-slot view
- Quick actions (Review, Assign Task, Create Schedule)

### Student Dashboard Enhancements
- My Day Schedule section (hour-by-hour)
- Entries with live status badges
- Notifications panel with unread count
- Pending tasks with due dates
- Schedule attendance marking

### New Pages
- Mentor: Schedule Management (`/mentor/schedules`)
- Student: My Schedule (`/student/schedule`)
- Both: Activity Feed (`/activity-feed`)
- Both: Notifications Center (`/notifications`)

## 🔐 Security & Access Control

### Authorization Rules
```javascript
// Mentor can only see:
- Own students' entries and metrics
- Own schedules and assigned schedules
- Activity related to own students

// Student can only see:
- Own entries and feedback
- Own assigned schedules
- Own tasks and notifications

// Real-time subscriptions:
- socket.join(`mentor:${mentorId}`) - Mentor's private room
- socket.join(`student:${studentId}`) - Student's private room
- socket.join(`cohort:${cohortId}`) - Cohort's shared room
```

## 📈 Performance Considerations

### Optimization Strategies
1. **Caching**
   - Cache active student counts
   - Cache entry metrics per mentor
   - Invalidate on updates

2. **Database Indexing**
   - Index on (mentorId, studentId) for schedules
   - Index on (eventType, createdAt) for activity feed
   - Index on (entityType, entityId) for audit logs

3. **Real-time Efficiency**
   - Batch updates every 2-3 seconds
   - Debounce rapid updates
   - Use room-based broadcasting

4. **Frontend Optimization**
   - Virtual scrolling for activity feeds
   - Lazy load schedule details
   - Memoize components

## 🧪 Testing Strategy

### Unit Tests
- Socket event handlers
- Database operations
- Authorization checks

### Integration Tests
- Real-time event flow
- Database consistency
- Access control

### E2E Tests
- Register student → mentor sees update
- Create entry → mentor sees live count
- Assign schedule → student receives notification
- Mark complete → both dashboards update

## 📅 Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| 2.1 | 3 days | WebSocket setup, basic connectivity |
| 2.2 | 2 days | Database schema, migrations |
| 2.3 | 3 days | Real-time dashboard, metrics |
| 2.4 | 5 days | Schedule feature, UI |
| 2.5 | 4 days | Notifications, activity feed |
| Testing | 3 days | QA, bug fixes |
| **Total** | **~3 weeks** | **Complete Phase 2** |

## 🚀 Deployment Considerations

### Backend
- Socket.IO requires sticky sessions (if load balanced)
- Use Redis adapter for multi-server deployments
- Monitor WebSocket connections

### Frontend
- Graceful fallback if WebSocket unavailable
- Reconnection logic with exponential backoff
- Offline queue for actions

### Database
- Run migrations before deployment
- Backup before schema changes
- Monitor query performance

## 📝 Documentation Updates

- [ ] Update README.md with real-time features
- [ ] Add Socket.IO setup guide
- [ ] Document new API endpoints
- [ ] Add real-time event reference
- [ ] Update deployment guide

## ✅ Acceptance Criteria

- [ ] Mentor dashboard updates in real-time (< 1s latency)
- [ ] Student registration appears in active count immediately
- [ ] Entry counts update live without page refresh
- [ ] Schedules can be created and assigned
- [ ] Students receive schedule notifications
- [ ] Activity feed shows all events
- [ ] No unauthorized access to other users' data
- [ ] WebSocket reconnects on disconnect
- [ ] Performance: < 100ms event processing
- [ ] All tests pass

## 🎯 Success Metrics

- Real-time latency: < 1 second
- WebSocket uptime: > 99.9%
- User engagement: +40% (estimated)
- Support tickets: -30% (estimated)
- Feature adoption: > 80% of users

---

**Next Steps:**
1. Review this plan with stakeholders
2. Prioritize features if needed
3. Begin Phase 2.1 implementation
4. Set up development environment with Socket.IO
5. Create feature branches for each phase
