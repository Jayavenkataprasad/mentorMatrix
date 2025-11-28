import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RealtimeProvider } from './context/RealtimeContext.jsx';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/Dashboard';
import StudentEntries from './pages/student/Entries';
import CreateEntry from './pages/student/CreateEntry';
import EditEntry from './pages/student/EditEntry';
import EntryDetail from './pages/student/EntryDetail';
import StudentTasks from './pages/student/Tasks';
import MCQQuiz from './pages/student/MCQQuiz';
import DoubtsEnhanced from './pages/student/DoubtsEnhanced';
import DoubtsSession from './pages/student/DoubtsSession';
import TaskQuestions from './pages/student/TaskQuestions';
import MentorDashboard from './pages/mentor/Dashboard';
import MentorStudents from './pages/mentor/Students';
import StudentsList from './pages/mentor/StudentsList';
import StudentActivity from './pages/mentor/StudentActivity';
import EntryReview from './pages/mentor/EntryReview';
import EntriesList from './pages/mentor/EntriesList';
import TaskAssignment from './pages/mentor/TaskAssignment';
import MCQManager from './pages/mentor/MCQManager';
import DoubtsQAEnhanced from './pages/mentor/DoubtsQAEnhanced';
import CompletedTasks from './pages/mentor/CompletedTasks';

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'student' ? '/student/dashboard' : '/mentor/dashboard'} />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : user.role === 'student' ? (
        <>
          <Route path="/student/dashboard" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/entries" element={<ProtectedRoute requiredRole="student"><StudentEntries /></ProtectedRoute>} />
          <Route path="/student/entries/create" element={<ProtectedRoute requiredRole="student"><CreateEntry /></ProtectedRoute>} />
          <Route path="/student/entries/:id" element={<ProtectedRoute requiredRole="student"><EntryDetail /></ProtectedRoute>} />
          <Route path="/student/entries/:id/edit" element={<ProtectedRoute requiredRole="student"><EditEntry /></ProtectedRoute>} />
          <Route path="/student/entries/:id/quiz" element={<ProtectedRoute requiredRole="student"><MCQQuiz /></ProtectedRoute>} />
          <Route path="/student/tasks" element={<ProtectedRoute requiredRole="student"><StudentTasks /></ProtectedRoute>} />
          <Route path="/student/doubts" element={<ProtectedRoute requiredRole="student"><DoubtsEnhanced /></ProtectedRoute>} />
          <Route path="/student/doubts-session" element={<ProtectedRoute requiredRole="student"><DoubtsSession /></ProtectedRoute>} />
          <Route path="/student/task-questions" element={<ProtectedRoute requiredRole="student"><TaskQuestions /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/student/dashboard" />} />
        </>
      ) : (
        <>
          <Route path="/mentor/dashboard" element={<ProtectedRoute requiredRole="mentor"><MentorDashboard /></ProtectedRoute>} />
          <Route path="/mentor/entries" element={<ProtectedRoute requiredRole="mentor"><EntriesList /></ProtectedRoute>} />
          <Route path="/mentor/students" element={<ProtectedRoute requiredRole="mentor"><MentorStudents /></ProtectedRoute>} />
          <Route path="/mentor/students-list" element={<ProtectedRoute requiredRole="mentor"><StudentsList /></ProtectedRoute>} />
          <Route path="/mentor/students/:studentId" element={<ProtectedRoute requiredRole="mentor"><StudentActivity /></ProtectedRoute>} />
          <Route path="/mentor/entries/:entryId" element={<ProtectedRoute requiredRole="mentor"><EntryReview /></ProtectedRoute>} />
          <Route path="/mentor/entries/:entryId/mcq" element={<ProtectedRoute requiredRole="mentor"><MCQManager /></ProtectedRoute>} />
          <Route path="/mentor/mcq" element={<ProtectedRoute requiredRole="mentor"><EntriesList /></ProtectedRoute>} />
          <Route path="/mentor/tasks/assign" element={<ProtectedRoute requiredRole="mentor"><TaskAssignment /></ProtectedRoute>} />
          <Route path="/mentor/doubts" element={<ProtectedRoute requiredRole="mentor"><DoubtsQAEnhanced /></ProtectedRoute>} />
          <Route path="/mentor/completed-tasks" element={<ProtectedRoute requiredRole="mentor"><CompletedTasks /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/mentor/dashboard" />} />
        </>
      )}
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutesWrapper />
      </AuthProvider>
    </Router>
  );
}

function AppRoutesWrapper() {
  const { user } = useAuth();
  return (
    <RealtimeProvider userId={user?.id} userRole={user?.role}>
      <AppRoutes />
    </RealtimeProvider>
  );
}

export default App;
