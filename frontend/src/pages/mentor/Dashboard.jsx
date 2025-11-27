import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { mentorAPI } from '../../api/client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, BookOpen, CheckCircle, AlertCircle, GraduationCap, MessageCircle, TrendingUp, Calendar, Clock, Award } from 'lucide-react';

export default function MentorDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await mentorAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Mentor Dashboard</h1>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/mentor/students-list')}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-6 transition-colors group"
          >
            <Users className="mb-3 group-hover:scale-110 transition-transform" size={24} />
            <p className="font-semibold">View Students</p>
            <p className="text-sm opacity-80">Manage your students</p>
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
