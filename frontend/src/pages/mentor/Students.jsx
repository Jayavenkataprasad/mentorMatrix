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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">My Students</h2>

        {students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map(student => (
              <div key={student.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                    <User size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{student.name}</h3>
                    <p className="text-gray-600 text-sm flex items-center gap-1">
                      <Mail size={14} />
                      {student.email}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  Joined: {new Date(student.createdAt).toLocaleDateString()}
                </p>

                <button
                  onClick={() => navigate(`/mentor/students/${student.id}`)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  <Eye size={18} />
                  View Activity
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No students found</p>
          </div>
        )}
      </div>
    </div>
  );
}
