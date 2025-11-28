import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { entriesAPI, mentorAPI } from '../../api/client';
import { ArrowLeft, Eye, Flame } from 'lucide-react';

export default function StudentActivity() {
  const { studentId } = useParams();
  const [entries, setEntries] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [studentId, filter]);

  const fetchData = async () => {
    try {
      const [entriesRes, streakRes] = await Promise.all([
        entriesAPI.getAll({ studentId, status: filter || undefined }),
        mentorAPI.getStreak(studentId)
      ]);
      setEntries(entriesRes.data);
      setStreak(streakRes.data.streak);
    } catch (error) {
      console.error('Failed to fetch data:', error);
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

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    needs_work: 'bg-red-100 text-red-800',
    approved: 'bg-green-100 text-green-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/mentor/students')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Students
        </button>

        {/* Student Info */}
        <div className="bg-white rounded-lg shadow px-4 sm:px-6 lg:p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Student Activity</h2>
              <p className="text-gray-600 mt-1">Student ID: {studentId}</p>
            </div>
            <div className="flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-lg">
              <Flame size={24} />
              <div>
                <p className="text-sm font-medium">Learning Streak</p>
                <p className="text-2xl font-bold">{streak} days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="needs_work">Needs Work</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          {entries.length > 0 ? (
            entries.map(entry => (
              <div key={entry.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-all px-4 sm:px-6 lg:p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800">{entry.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{entry.body}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[entry.status]}`}>
                    {entry.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {entry.tags?.map(tag => (
                    <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(entry.createdAt).toLocaleString()}</span>
                  <button
                    onClick={() => navigate(`/mentor/entries/${entry.id}`)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-all"
                  >
                    <Eye size={18} />
                    Review
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 text-lg">No entries found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
