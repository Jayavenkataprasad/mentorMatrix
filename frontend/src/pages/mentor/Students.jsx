import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { mentorAPI } from '../../api/client';
import { Eye, Mail, User } from 'lucide-react';

export default function MentorStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await mentorAPI.getStudents();
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
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
            <p className="text-purple-200 mt-4">Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:p-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">My Students</h1>
          <p className="text-purple-200">Manage and monitor your students' progress</p>
        </div>

        {students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map(student => (
              <div key={student.id} className="bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-700/30 transition-all p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                    <User size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{student.name}</h3>
                    <p className="text-gray-300 text-sm flex items-center gap-1">
                      <Mail size={14} />
                      {student.email}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mb-4">
                  Joined: {new Date(student.createdAt).toLocaleDateString()}
                </p>

                <button
                  onClick={() => navigate(`/mentor/students/${student.id}`)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all"
                >
                  <Eye size={18} />
                  View Activity
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
            <User className="mx-auto text-gray-500 mb-4" size={48} />
            <p className="text-gray-400 text-lg">No students found</p>
            <p className="text-gray-500 text-sm mt-2">Students will appear here once they register</p>
          </div>
        )}
      </div>
    </div>
  );
}
