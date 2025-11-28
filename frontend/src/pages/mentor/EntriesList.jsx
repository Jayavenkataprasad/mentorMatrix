import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { entriesAPI } from '../../api/client';
import { Eye, Edit3, Plus, Search, Filter, Calendar, Tag, Clock, BookOpen, Users } from 'lucide-react';

export default function MentorEntriesList() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntries();
  }, [filter]);

  const fetchEntries = async () => {
    try {
      const response = await entriesAPI.getAll({ status: filter || undefined });
      setEntries(response.data);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry => 
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.body && entry.body.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
    (entry.studentName && entry.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const statusColors = {
    pending: 'bg-yellow-600/20 text-yellow-300 border-yellow-500',
    reviewed: 'bg-blue-600/20 text-blue-300 border-blue-500',
    needs_work: 'bg-orange-600/20 text-orange-300 border-orange-500',
    approved: 'bg-green-600/20 text-green-300 border-green-500'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <p className="text-purple-200 mt-4">Loading entries...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Student Entries</h1>
          <p className="text-purple-200">Review and manage student learning entries</p>
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
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="needs_work">Needs Work</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Total Entries</p>
                <p className="text-3xl font-bold text-white">{entries.length}</p>
              </div>
              <BookOpen className="text-blue-400" size={32} />
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {entries.filter(e => e.status === 'pending').length}
                </p>
              </div>
              <Clock className="text-yellow-400" size={32} />
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-400">
                  {entries.filter(e => e.status === 'approved').length}
                </p>
              </div>
              <Eye className="text-green-400" size={32} />
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Students</p>
                <p className="text-3xl font-bold text-purple-400">
                  {[...new Set(entries.map(e => e.studentId))].length}
                </p>
              </div>
              <Users className="text-purple-400" size={32} />
            </div>
          </div>
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
              <BookOpen className="mx-auto text-gray-500 mb-4" size={48} />
              <p className="text-gray-400 text-lg">
                {searchTerm || filter ? 'No entries found matching your criteria.' : 'No entries yet'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {searchTerm || filter ? 'Try adjusting your search or filters.' : 'Student entries will appear here'}
              </p>
            </div>
          ) : (
            filteredEntries.map(entry => (
              <div
                key={entry.id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-700/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{entry.title}</h3>
                    <p className="text-gray-300 mb-3 line-clamp-2">
                      {entry.body ? entry.body.substring(0, 150) + '...' : 'No content'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {entry.studentName}
                      </span>
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
                        className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-lg text-xs border border-purple-500"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => navigate(`/mentor/entries/${entry.id}`)}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Eye size={16} />
                    Review
                  </button>
                  <button
                    onClick={() => navigate(`/mentor/entries/${entry.id}/mcq`)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Edit3 size={16} />
                    MCQ Questions
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
