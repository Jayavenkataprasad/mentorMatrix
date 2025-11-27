import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { tasksAPI, api } from '../../api/client';
import { Save, X } from 'lucide-react';

export default function TaskAssignment() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    title: '',
    description: '',
    dueDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/users/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await tasksAPI.create({
        studentId: parseInt(formData.studentId),
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate || null
      });
      setSuccess('Task assigned successfully!');
      setFormData({ studentId: '', title: '', description: '', dueDate: '' });
      setTimeout(() => {
        navigate('/mentor/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign task');
    } finally {
      setSubmitting(false);
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-white mb-2">Assign Task to Student</h2>
        <p className="text-purple-200 mb-8">Create and assign tasks to any registered student</p>

        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg flex items-start gap-3">
            <span className="text-red-300">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-600/20 border border-green-500 rounded-lg flex items-start gap-3">
            <span className="text-green-300">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-xl shadow-xl p-6 space-y-6 backdrop-blur-sm">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Student *</label>
            <p className="text-xs text-gray-400 mb-2">
              {students.length} registered student{students.length !== 1 ? 's' : ''} available
            </p>
            <select
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              required
            >
              <option value="" className="text-gray-400">Select a student</option>
              {students.map(student => (
                <option key={student.id} value={student.id} className="text-white">
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Task Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Complete DSA Module 1"
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide details about the task..."
              rows="5"
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Due Date</label>
            <input
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-6 py-3 rounded-xl transition-colors flex items-center justify-center"
            >
              <Save size={20} />
              {submitting ? 'Assigning...' : 'Assign Task'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/mentor/dashboard')}
              className="flex items-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl transition-colors"
            >
              <X size={20} />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
