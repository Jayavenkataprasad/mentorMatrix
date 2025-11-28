import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { entriesAPI, mcqAPI } from '../../api/client';
import { Plus, Edit2, Trash2, Play, Clock, Search, Calendar, Eye, Tag, CheckCircle } from 'lucide-react';

export default function StudentEntries() {
  const [entries, setEntries] = useState([]);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [lastQuizSubmission, setLastQuizSubmission] = useState(null);

  useEffect(() => {
    fetchEntries();
    fetchAttemptedQuizzes();
    
    // Listen for quiz submissions from other components
    const handleQuizSubmission = (event) => {
      console.log('StudentEntries: Detected quiz submission, refreshing...');
      setLastQuizSubmission(Date.now());
      fetchAttemptedQuizzes();
    };

    window.addEventListener('quizSubmitted', handleQuizSubmission);
    
    return () => {
      window.removeEventListener('quizSubmitted', handleQuizSubmission);
    };
  }, [filter, tagFilter, lastQuizSubmission]); // Re-fetch when quiz is submitted

  const fetchAttemptedQuizzes = async () => {
    try {
      // Get all entries to check for attempted quizzes
      const entriesResponse = await entriesAPI.getAll();
      const allEntries = entriesResponse.data;
      
      const attemptedSet = new Set();
      
      // First, check localStorage for immediate feedback
      const localAttemptedQuizzes = JSON.parse(localStorage.getItem('attemptedQuizzes') || '[]');
      localAttemptedQuizzes.forEach(entryId => attemptedSet.add(parseInt(entryId)));
      
      // Then verify with backend (this will confirm and sync)
      for (const entry of allEntries) {
        try {
          const quizResults = await mcqAPI.getMyAnswers(entry.id);
          if (quizResults.data.length > 0) {
            attemptedSet.add(entry.id);
            console.log(`StudentEntries: Quiz attempted for entry ${entry.id}`);
          }
        } catch (error) {
          // No quiz results for this entry
        }
      }
      
      // Update localStorage with latest data
      localStorage.setItem('attemptedQuizzes', JSON.stringify([...attemptedSet]));
      
      setAttemptedQuizzes(attemptedSet);
      console.log(`StudentEntries: Updated attempted quizzes:`, attemptedSet);
    } catch (error) {
      console.error('Failed to fetch attempted quizzes:', error);
    }
  };

  const fetchEntries = async () => {
    try {
      const response = await entriesAPI.getAll({ status: filter || undefined, tag: tagFilter || undefined });
      console.log('Entries loaded:', response.data);
      setEntries(response.data);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      console.error('Cannot delete entry: Invalid ID');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await entriesAPI.delete(id);
        setEntries(entries.filter(e => e.id !== id));
      } catch (error) {
        console.error('Failed to delete entry:', error);
      }
    }
  };

  const filteredEntries = entries.filter(entry => {
    return entry.id && 
    entry.title && 
    (entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.content && entry.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))));
  });

  const statusColors = {
    pending: 'bg-yellow-600/20 text-yellow-300 border-yellow-500',
    approved: 'bg-green-600/20 text-green-300 border-green-500',
    rejected: 'bg-red-600/20 text-red-300 border-red-500'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-slate-500 mt-4">Loading entries...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">My Learning Entries</h1>
          <p className="text-purple-200">Document and track your learning journey</p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border border-white/20 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border border-white/20 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              onClick={() => navigate('/student/entries/create')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              New Entry
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-1">Total Entries</p>
                <p className="text-3xl font-bold text-slate-900">{entries.length}</p>
              </div>
              <Calendar className="text-blue-400" size={32} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-sky-100/50 to-blue-100/30 border border-sky-200/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-500">
                  {entries.filter(e => e.status === 'pending').length}
                </p>
              </div>
              <Clock className="text-yellow-400" size={32} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-sky-100/50 to-blue-100/30 border border-sky-200/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-500">
                  {entries.filter(e => e.status === 'approved').length}
                </p>
              </div>
              <Eye className="text-green-400" size={32} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-sky-100/50 to-blue-100/30 border border-sky-200/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-1">Unique Tags</p>
                <p className="text-3xl font-bold text-purple-500">
                  {[...new Set(entries.flatMap(e => e.tags || []))].length}
                </p>
              </div>
              <Tag className="text-purple-400" size={32} />
            </div>
          </div>
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border border-white/20 rounded-xl p-12 text-center shadow-sm">
              <Calendar className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-500 text-lg">
                {searchTerm || filter ? 'No entries found matching your criteria.' : 'No entries yet'}
              </p>
              <p className="text-slate-400 text-sm mt-2">
                {searchTerm || filter ? 'Try adjusting your search or filters.' : 'Start documenting your learning journey'}
              </p>
              {!searchTerm && !filter && (
                <button
                  onClick={() => navigate('/student/entries/create')}
                  className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl"
                >
                  <Plus size={20} />
                  Create Your First Entry
                </button>
              )}
            </div>
          ) : (
            filteredEntries.map(entry => (
              <div
                key={entry.id}
                className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{entry.title}</h3>
                    <p className="text-slate-700 mb-3 line-clamp-2">
                      {entry.content ? entry.content.substring(0, 150) + '...' : 'No content'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                      {entry.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          Deadline: {new Date(entry.deadline).toLocaleDateString()}
                        </span>
                      )}
                      {entry.mentorName && (
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          Reviewed by {entry.mentorName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[entry.status]}`}>
                      {entry.status}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {entry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 rounded-lg text-xs border border-purple-200 backdrop-blur-sm"
                        >
                          #{tag}
                        </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/20">
                  {entry.id && (
                    <button
                      onClick={() => navigate(`/student/entries/${entry.id}`)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  )}
                  {entry.id && (
                    <button
                      onClick={() => navigate(`/student/entries/${entry.id}/edit`)}
                      className="bg-gradient-to-br from-slate-100/80 to-slate-200/60 hover:from-slate-200/80 hover:to-slate-300/60 text-slate-900 px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 border border-slate-300"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                  )}
                  {entry.deadline && new Date(entry.deadline) <= new Date() && entry.id && (
                    attemptedQuizzes.has(entry.id) ? (
                      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                        <CheckCircle size={16} />
                        Quiz Attempted
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          console.log(`Take Quiz clicked for entry ${entry.id}: ${entry.title}`);
                          console.log('Entry details:', entry);
                          navigate(`/student/entries/${entry.id}/quiz`);
                        }}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <Play size={16} />
                        Take Quiz
                      </button>
                    )
                  )}
                  {entry.deadline && new Date(entry.deadline) > new Date() && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm flex items-center gap-1 backdrop-blur-sm">
                      <Clock size={14} />
                      Deadline: {new Date(entry.deadline).toLocaleDateString()}
                    </div>
                  )}
                  {entry.id && (
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
