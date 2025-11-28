import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Calendar, Search, GraduationCap } from 'lucide-react';
import { api } from '../../api/client.js';
import { useRealtime } from '../../context/RealtimeContext.jsx';
import Navbar from '../../components/Navbar';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { notifications } = useRealtime();

  // Fetch students on mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // React to new student registrations
  useEffect(() => {
    const studentRegEvents = notifications.filter(n => n.type === 'student:registered');
    if (studentRegEvents.length > 0) {
      fetchStudents();
    }
  }, [notifications]);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/users/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 sm:px-6 lg:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <p className="text-purple-200 mt-4">Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 sm:px-6 lg:p-6">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <GraduationCap className="text-purple-400" />
            Students List
          </h1>
          <p className="text-purple-200">View all registered students in the portal</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gapx-4 sm:px-6 lg:p-6 mb-8">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl px-4 sm:px-6 lg:p-6 transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-white">{students.length}</p>
              </div>
              <Users className="text-purple-400" size={32} />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl px-4 sm:px-6 lg:p-6 transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">New This Week</p>
                <p className="text-3xl font-bold text-white">
                  {students.filter(s => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(s.createdAt) > weekAgo;
                  }).length}
                </p>
              </div>
              <UserPlus className="text-blue-400" size={32} />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl px-4 sm:px-6 lg:p-6 transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">Active Today</p>
                <p className="text-3xl font-bold text-white">
                  {students.filter(s => {
                    const today = new Date().toDateString();
                    return new Date(s.createdAt).toDateString() === today;
                  }).length}
                </p>
              </div>
              <Calendar className="text-green-400" size={32} />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Students List */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 sm:px-6 lg:p-6 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">Registered Students</h2>
          </div>
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto text-gray-500 mb-4" size={48} />
              <p className="text-gray-400">
                {searchTerm ? 'No students found matching your search.' : 'No students registered yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {filteredStudents.map((student, index) => (
                <div
                  key={student.id}
                  className="px-4 sm:px-6 lg:p-6 hover:bg-slate-700/30 transition-all duration-200 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold group-hover:text-purple-300 transition-colors">
                        {student.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Mail size={14} />
                          {student.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          Joined {formatDate(student.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-600/20 text-green-300 border border-green-500/50 rounded-full text-sm">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
