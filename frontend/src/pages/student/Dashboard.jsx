import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { studentAPI } from '../../api/client';
import { useRealtime } from '../../context/RealtimeContext.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Flame, Plus, CheckCircle, AlertCircle, MessageCircle, HelpCircle, TrendingUp, Calendar, Clock } from 'lucide-react';

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { notifications } = useRealtime();

  useEffect(() => {
    fetchDashboard();
  }, []);

  // React to real-time doubt updates
  useEffect(() => {
    const doubtEvents = notifications.filter(n => 
      n.type === 'doubt:created' || n.type === 'doubt:resolved'
    );
    if (doubtEvents.length > 0) {
      fetchDashboard();
    }
  }, [notifications]);

  const fetchDashboard = async () => {
    try {
      const response = await studentAPI.getDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
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
            <p className="text-purple-200 mt-4">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = dashboard?.weeklyData?.map(d => ({
    day: dayNames[new Date(d.date).getDay()],
    entries: d.entries
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Student Dashboard</h1>
          <p className="text-purple-200">Welcome back! Track your learning progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-700/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="text-blue-400" size={24} />
              <span className="text-xs text-purple-300 font-medium">Total</span>
            </div>
            <p className="text-3xl font-bold text-white">{dashboard?.totalEntries || 0}</p>
            <p className="text-sm text-gray-400 mt-1">Learning Entries</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-700/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Flame className="text-orange-400" size={24} />
              <span className="text-xs text-purple-300 font-medium">Streak</span>
            </div>
            <p className="text-3xl font-bold text-white">{dashboard?.currentStreak || 0}</p>
            <p className="text-sm text-gray-400 mt-1">Day Streak</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-700/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="text-green-400" size={24} />
              <span className="text-xs text-purple-300 font-medium">Completed</span>
            </div>
            <p className="text-3xl font-bold text-white">{dashboard?.completedTasks || 0}</p>
            <p className="text-sm text-gray-400 mt-1">Tasks Done</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-700/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <MessageCircle className="text-purple-400" size={24} />
              <span className="text-xs text-purple-300 font-medium">Active</span>
            </div>
            <p className="text-3xl font-bold text-white">{dashboard?.activeDoubts || 0}</p>
            <p className="text-sm text-gray-400 mt-1">Doubts</p>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <TrendingUp className="text-blue-400" size={20} />
              Weekly Activity
            </h2>
            <span className="text-sm text-gray-400">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
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
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => navigate('/student/entries/create')}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-6 transition-colors group"
          >
            <Plus className="mb-3 group-hover:scale-110 transition-transform" size={24} />
            <p className="font-semibold">New Entry</p>
            <p className="text-sm opacity-80">Document learning</p>
          </button>

          <button
            onClick={() => navigate('/student/tasks')}
            className="bg-slate-700 hover:bg-slate-600 text-white rounded-xl p-6 transition-colors group"
          >
            <CheckCircle className="mb-3 group-hover:scale-110 transition-transform" size={24} />
            <p className="font-semibold">My Tasks</p>
            <p className="text-sm opacity-80">{dashboard?.pendingTasks || 0} pending</p>
          </button>

          <button
            onClick={() => navigate('/student/doubts')}
            className="bg-slate-700 hover:bg-slate-600 text-white rounded-xl p-6 transition-colors group"
          >
            <HelpCircle className="mb-3 group-hover:scale-110 transition-transform" size={24} />
            <p className="font-semibold">Ask Doubt</p>
            <p className="text-sm opacity-80">Get help</p>
          </button>

          <button
            onClick={() => navigate('/student/entries')}
            className="bg-slate-700 hover:bg-slate-600 text-white rounded-xl p-6 transition-colors group"
          >
            <BookOpen className="mb-3 group-hover:scale-110 transition-transform" size={24} />
            <p className="font-semibold">View Entries</p>
            <p className="text-sm opacity-80">Browse all</p>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Entries */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Recent Entries</h2>
              <Calendar className="text-gray-400" size={20} />
            </div>
            {dashboard?.recentEntries?.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentEntries.slice(0, 3).map(entry => (
                  <div key={entry.id} className="bg-slate-700/30 p-3 rounded-lg">
                    <p className="text-white font-medium">{entry.title}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="mx-auto text-gray-500 mb-2" size={32} />
                <p className="text-gray-400">No entries yet</p>
                <button
                  onClick={() => navigate('/student/entries/create')}
                  className="mt-3 text-purple-400 hover:text-purple-300 text-sm"
                >
                  Create your first entry
                </button>
              </div>
            )}
          </div>

          {/* Recent Doubts */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Recent Doubts</h2>
              <MessageCircle className="text-gray-400" size={20} />
            </div>
            {dashboard?.recentDoubts?.filter(doubt => doubt.status !== 'resolved').length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentDoubts.filter(doubt => doubt.status !== 'resolved').slice(0, 3).map(doubt => (
                  <div key={doubt.id} className="bg-slate-700/30 p-3 rounded-lg">
                    <p className="text-white font-medium">{doubt.question}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-600/20 text-yellow-300">
                        {doubt.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(doubt.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <HelpCircle className="mx-auto text-gray-500 mb-2" size={32} />
                <p className="text-gray-400">No unresolved doubts</p>
                <button
                  onClick={() => navigate('/student/doubts')}
                  className="mt-3 text-purple-400 hover:text-purple-300 text-sm"
                >
                  View all doubts
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
