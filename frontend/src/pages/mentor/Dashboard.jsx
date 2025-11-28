import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { mentorAPI, mcqAPI, entriesAPI } from '../../api/client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, BookOpen, CheckCircle, AlertCircle, GraduationCap, MessageCircle, TrendingUp, Calendar, Clock, Award, HelpCircle, Brain } from 'lucide-react';

export default function MentorDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [quizAnalytics, setQuizAnalytics] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
    fetchStudents();
    fetchQuizAnalytics();
    
    // Listen for quiz submissions from students
    const handleQuizSubmission = (event) => {
      console.log('MentorDashboard: Detected quiz submission, refreshing analytics...');
      fetchQuizAnalytics();
      fetchAnalytics(); // Also refresh general analytics
    };

    window.addEventListener('quizSubmitted', handleQuizSubmission);
    
    return () => {
      window.removeEventListener('quizSubmitted', handleQuizSubmission);
    };
  }, [selectedStudent]); // Re-fetch when student selection changes

  const fetchAnalytics = async () => {
    try {
      const response = await mentorAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await mentorAPI.getStudents();
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchQuizAnalytics = async () => {
    try {
      // Get all entries for this mentor
      const entriesResponse = await entriesAPI.getAll();
      const entries = entriesResponse.data;
      
      // Filter entries by selected student if one is selected
      const filteredEntries = selectedStudent 
        ? entries.filter(entry => entry.studentId === selectedStudent.id)
        : entries;
      
      let totalQuizzes = 0;
      let completedQuizzes = 0;
      let averageScore = 0;
      let totalScore = 0;
      let maxPossibleScore = 0;

      // Fetch quiz results for each filtered entry
      for (const entry of filteredEntries) {
        try {
          const quizResults = await mcqAPI.getStudentAnswers(entry.id);
          if (quizResults.data.length > 0) {
            totalQuizzes++;
            completedQuizzes++;
            
            // Calculate scores for this entry
            quizResults.data.forEach(result => {
              totalScore += result.points || 0;
              maxPossibleScore += result.totalPoints || 1;
            });
          } else {
            // Check if questions exist for this entry
            try {
              const questions = await mcqAPI.getQuestions(entry.id);
              if (questions.data.length > 0) {
                totalQuizzes++;
              }
            } catch (error) {
              // No questions for this entry
            }
          }
        } catch (error) {
          // No quiz results for this entry
        }
      }

      averageScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

      setQuizAnalytics({
        totalQuizzes,
        completedQuizzes,
        averageScore,
        pendingQuizzes: totalQuizzes - completedQuizzes,
        studentName: selectedStudent ? selectedStudent.name : 'All Students'
      });
    } catch (error) {
      console.error('Failed to fetch quiz analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <p className="text-purple-200 mt-4">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const statusData = analytics?.entriesByStatus || [];
  const COLORS = ['#FBBF24', '#3B82F6', '#EF4444', '#10B981'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Mentor Dashboard</h1>
          <p className="text-purple-200">Track your students' progress and engagement</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-700/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-blue-400" size={24} />
              <span className="text-xs text-purple-300 font-medium">Total</span>
            </div>
            <p className="text-3xl font-bold text-white">{analytics?.totalStudents || 0}</p>
            <p className="text-sm text-gray-400 mt-1">Active Students</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-700/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="text-green-400" size={24} />
              <span className="text-xs text-purple-300 font-medium">Total</span>
            </div>
            <p className="text-3xl font-bold text-white">{analytics?.totalEntries || 0}</p>
            <p className="text-sm text-gray-400 mt-1">Learning Entries</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-700/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="text-yellow-400" size={24} />
              <span className="text-xs text-purple-300 font-medium">Pending</span>
            </div>
            <p className="text-3xl font-bold text-white">{analytics?.pendingReviews || 0}</p>
            <p className="text-sm text-gray-400 mt-1">Reviews Needed</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-700/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <MessageCircle className="text-purple-400" size={24} />
              <span className="text-xs text-purple-300 font-medium">Active</span>
            </div>
            <p className="text-3xl font-bold text-white">{analytics?.activeDoubts || 0}</p>
            <p className="text-sm text-gray-400 mt-1">Student Doubts</p>
          </div>
        </div>

        {/* Student Selector for Quiz Analytics */}
        <div className="bg-gradient-to-br from-purple-800/50 to-indigo-800/50 backdrop-blur-xl border border-purple-600/50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Brain className="text-purple-400" size={20} />
              Quiz Analytics
            </h3>
            <select
              value={selectedStudent ? selectedStudent.id : ''}
              onChange={(e) => {
                const student = students.find(s => s.id === e.target.value);
                setSelectedStudent(student || null);
              }}
              className="bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
          {selectedStudent && (
            <p className="text-purple-200 text-sm">
              Showing quiz results for <span className="font-semibold text-white">{selectedStudent.name}</span>
            </p>
          )}
        </div>

        {/* Quiz Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-800/50 to-indigo-800/50 backdrop-blur-xl border border-purple-600/50 rounded-xl p-6 hover:bg-purple-700/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Brain className="text-purple-400" size={24} />
              <span className="text-xs text-purple-300 font-medium">Total</span>
            </div>
            <p className="text-3xl font-bold text-white">{quizAnalytics?.totalQuizzes || 0}</p>
            <p className="text-sm text-purple-200 mt-1">
            {selectedStudent ? `${selectedStudent.name}'s Quizzes` : 'Quiz Created'}
          </p>
          </div>

          <div className="bg-gradient-to-br from-green-800/50 to-emerald-800/50 backdrop-blur-xl border border-green-600/50 rounded-xl p-6 hover:bg-green-700/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="text-green-400" size={24} />
              <span className="text-xs text-purple-300 font-medium">Completed</span>
            </div>
            <p className="text-3xl font-bold text-white">{quizAnalytics?.completedQuizzes || 0}</p>
            <p className="text-sm text-purple-200 mt-1">Quizzes Taken</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-800/50 to-orange-800/50 backdrop-blur-xl border border-yellow-600/50 rounded-xl p-6 hover:bg-yellow-700/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Award className="text-yellow-400" size={24} />
              <span className="text-xs text-purple-300 font-medium">Average</span>
            </div>
            <p className="text-3xl font-bold text-white">{quizAnalytics?.averageScore || 0}%</p>
            <p className="text-sm text-purple-200 mt-1">
              {selectedStudent ? `${selectedStudent.name}'s Score` : 'Average Score'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-800/50 to-pink-800/50 backdrop-blur-xl border border-red-600/50 rounded-xl p-6 hover:bg-red-700/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Clock className="text-red-400" size={24} />
              <span className="text-xs text-purple-300 font-medium">Pending</span>
            </div>
            <p className="text-3xl font-bold text-white">{quizAnalytics?.pendingQuizzes || 0}</p>
            <p className="text-sm text-purple-200 mt-1">
              {selectedStudent ? `Awaiting ${selectedStudent.name}` : 'Awaiting Results'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => navigate('/mentor/students-list')}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-6 transition-colors group"
          >
            <Users className="mb-3 group-hover:scale-110 transition-transform" size={24} />
            <p className="font-semibold">View Students</p>
            <p className="text-sm opacity-80">Manage your students</p>
          </button>

          <button
            onClick={() => navigate('/mentor/entries')}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-6 transition-colors group"
          >
            <HelpCircle className="mb-3 group-hover:scale-110 transition-transform" size={24} />
            <p className="font-semibold">MCQ Questions</p>
            <p className="text-sm opacity-80">Create assessments</p>
          </button>

          <button
            onClick={() => navigate('/mentor/tasks/assign')}
            className="bg-slate-700 hover:bg-slate-600 text-white rounded-xl p-6 transition-colors group"
          >
            <GraduationCap className="mb-3 group-hover:scale-110 transition-transform" size={24} />
            <p className="font-semibold">Assign Tasks</p>
            <p className="text-sm opacity-80">Create new tasks</p>
          </button>

          <button
            onClick={() => navigate('/mentor/completed-tasks')}
            className="bg-slate-700 hover:bg-slate-600 text-white rounded-xl p-6 transition-colors group"
          >
            <CheckCircle className="mb-3 group-hover:scale-110 transition-transform" size={24} />
            <p className="font-semibold">Completed Tasks</p>
            <p className="text-sm opacity-80">Review progress</p>
          </button>

          <button
            onClick={() => navigate('/mentor/mcq')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl p-6 transition-colors group"
          >
            <Brain className="mb-3 group-hover:scale-110 transition-transform" size={24} />
            <p className="font-semibold">Quiz Results</p>
            <p className="text-sm opacity-80">View quiz analytics</p>
          </button>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Entries Status Chart */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <TrendingUp className="text-blue-400" size={20} />
                Entry Status Distribution
              </h2>
              <Calendar className="text-gray-400" size={20} />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Activity Chart */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Award className="text-green-400" size={20} />
                Weekly Activity
              </h2>
              <Clock className="text-gray-400" size={20} />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics?.weeklyActivity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="entries" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 6 }}
                  activeDot={{ r: 8 }}
                  name="Entries"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Entries */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Recent Entries</h2>
              <BookOpen className="text-gray-400" size={20} />
            </div>
            {analytics?.recentEntries?.length > 0 ? (
              <div className="space-y-3">
                {analytics.recentEntries.slice(0, 4).map(entry => (
                  <div key={entry.id} className="bg-slate-700/30 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{entry.title}</p>
                        <p className="text-sm text-gray-400">{entry.studentName}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        entry.status === 'approved' 
                          ? 'bg-green-600/20 text-green-300' 
                          : entry.status === 'rejected'
                          ? 'bg-red-600/20 text-red-300'
                          : 'bg-yellow-600/20 text-yellow-300'
                      }`}>
                        {entry.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="mx-auto text-gray-500 mb-2" size={32} />
                <p className="text-gray-400">No recent entries</p>
              </div>
            )}
          </div>

          {/* Entries Needing Questions */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Assessment Questions</h2>
              <HelpCircle className="text-gray-400" size={20} />
            </div>
            <div className="space-y-3">
              <div className="bg-purple-600/20 border border-purple-500 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Create MCQ Questions</p>
                    <p className="text-sm text-purple-200">Test student understanding with interactive questions</p>
                  </div>
                  <button
                    onClick={() => navigate('/mentor/entries')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                  >
                    <HelpCircle size={14} />
                    Manage
                  </button>
                </div>
              </div>
              <div className="bg-blue-600/20 border border-blue-500 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-blue-300">
                  <Calendar size={16} />
                  <p className="text-sm">Set deadlines for better assessment control</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Doubts */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Recent Doubts</h2>
              <MessageCircle className="text-gray-400" size={20} />
            </div>
            {analytics?.recentDoubts?.length > 0 ? (
              <div className="space-y-3">
                {analytics.recentDoubts.slice(0, 4).map(doubt => (
                  <div key={doubt.id} className="bg-slate-700/30 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-sm">{doubt.question}</p>
                        <p className="text-sm text-gray-400">{doubt.studentName}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        doubt.status === 'resolved' 
                          ? 'bg-green-600/20 text-green-300' 
                          : 'bg-yellow-600/20 text-yellow-300'
                      }`}>
                        {doubt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="mx-auto text-gray-500 mb-2" size={32} />
                <p className="text-gray-400">No recent doubts</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
