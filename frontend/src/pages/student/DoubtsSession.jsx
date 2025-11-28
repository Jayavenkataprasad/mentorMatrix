import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Search, Filter, Clock, CheckCircle, AlertCircle, Star, HelpCircle, BookOpen, Briefcase, Paperclip } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client.js';
import { useRealtime } from '../../context/RealtimeContext.jsx';
import DoubtForm from './DoubtForm.jsx';

export default function DoubtsSession() {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const { notifications } = useRealtime();

  // Fetch doubts on mount
  useEffect(() => {
    fetchDoubts();
  }, []);

  // React to real-time updates
  useEffect(() => {
    const doubtEvents = notifications.filter(n => 
      n.type === 'doubt:created' || n.type === 'doubt:answered' || n.type === 'doubt:resolved'
    );
    if (doubtEvents.length > 0) {
      fetchDoubts();
      // Also update selected doubt if it's currently open
      if (selectedDoubt) {
        fetchDoubtDetails(selectedDoubt.id);
      }
    }
  }, [notifications, selectedDoubt]);

  const fetchDoubts = async () => {
    try {
      const response = await api.get('/doubts');
      setDoubts(response.data);
    } catch (error) {
      console.error('Error fetching doubts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoubtDetails = async (doubtId) => {
    try {
      const response = await api.get(`/doubts/${doubtId}`);
      setSelectedDoubt(response.data);
    } catch (error) {
      console.error('Error fetching doubt details:', error);
    }
  };

  const handleDoubtSubmit = () => {
    setShowForm(false);
    fetchDoubts();
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: 'bg-red-100 text-red-800 border-red-300',
      answered: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      resolved: 'bg-green-100 text-green-800 border-green-300',
      needs_more_explanation: 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <AlertCircle size={16} />;
      case 'answered':
        return <MessageCircle size={16} />;
      case 'resolved':
        return <CheckCircle size={16} />;
      case 'needs_more_explanation':
        return <AlertCircle size={16} />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type) => {
    return type === 'project' ? <Briefcase size={16} /> : <BookOpen size={16} />;
  };

  const handleRating = async (answerId, rating) => {
    try {
      await api.post(`/doubts/${selectedDoubt.id}/answers/${answerId}/rate`, { rating });
      fetchDoubts();
      setSelectedDoubt(null);
      alert('Thank you for rating the answer!');
    } catch (error) {
      console.error('Error rating answer:', error);
      alert('Failed to rate answer');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredDoubts = doubts.filter(doubt => {
    const matchesSearch = doubt.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doubt.concept.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doubt.status === filterStatus;
    const matchesType = filterType === 'all' || doubt.doubtType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (showForm) {
    return <DoubtForm onSubmit={handleDoubtSubmit} onCancel={() => setShowForm(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
            <p className="text-slate-500 mt-4">Loading doubts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <MessageCircle className="text-purple-400" />
            Doubts Session
          </h1>
          <p className="text-purple-200">Ask questions and get help from mentors</p>
        </div>

        {/* Action Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl hover:shadow-lg font-semibold flex items-center gap-2"
          >
            <Plus size={20} />
            Ask a New Doubt
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search doubts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="answered">Answered</option>
            <option value="resolved">Resolved</option>
            <option value="needs_more_explanation">Needs More Explanation</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All Types</option>
            <option value="concept">Concept</option>
            <option value="project">Project</option>
          </select>
        </div>

        {/* Doubts List */}
        <div className="space-y-4">
          {filteredDoubts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <HelpCircle className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-500">
                {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                  ? 'No doubts found matching your filters.'
                  : 'No doubts yet. Ask your first question!'}
              </p>
            </div>
          ) : (
            filteredDoubts.map(doubt => (
              <div
                key={doubt.id}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => fetchDoubtDetails(doubt.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTypeIcon(doubt.doubtType)}
                      <h3 className="text-slate-900 font-semibold text-lg">{doubt.concept}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(doubt.status)}`}>
                        {getStatusIcon(doubt.status)}
                        <span className="ml-1">{doubt.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <p className="text-slate-700 mb-3">{doubt.question}</p>
                    {doubt.description && (
                      <p className="text-slate-500 text-sm mb-3">{doubt.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDate(doubt.createdAt)}
                      </span>
                      {doubt.subject && <span>Subject: {doubt.subject}</span>}
                      {doubt.techStack && <span>Tech: {doubt.techStack}</span>}
                      {doubt.projectName && <span>Project: {doubt.projectName}</span>}
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      doubt.priority === 'high' ? 'bg-red-100 text-red-700' :
                      doubt.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {doubt.priority} priority
                    </span>
                  </div>
                </div>

                {/* Answers Preview */}
                {doubt.answers && doubt.answers.length > 0 && (
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <p className="text-sm text-slate-500 mb-2">
                      {doubt.answers.length} {doubt.answers.length === 1 ? 'answer' : 'answers'}
                    </p>
                    {doubt.answers[0] && (
                      <div className="bg-emerald-50 border-l-4 border-emerald-400 p-3 rounded">
                        <p className="text-emerald-700 text-sm font-medium mb-1">
                          {doubt.answers[0].mentorName}
                        </p>
                        <p className="text-slate-600 text-sm line-clamp-2">
                          {doubt.answers[0].answer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Doubt Detail Modal */}
        {selectedDoubt && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">{selectedDoubt.concept}</h2>
                  <button
                    onClick={() => setSelectedDoubt(null)}
                    className="text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <AlertCircle size={24} />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    {getTypeIcon(selectedDoubt.doubtType)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(selectedDoubt.status)}`}>
                      {getStatusIcon(selectedDoubt.status)}
                      <span className="ml-1">{selectedDoubt.status.replace('_', ' ')}</span>
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedDoubt.priority === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      selectedDoubt.priority === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-sky-50 text-sky-700 border border-sky-200'
                    }`}>
                      {selectedDoubt.priority} priority
                    </span>
                  </div>
                  <p className="text-slate-700 text-lg mb-3">{selectedDoubt.question}</p>
                  {selectedDoubt.description && (
                    <p className="text-slate-600 mb-4">{selectedDoubt.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>Asked {formatDate(selectedDoubt.createdAt)}</span>
                    {selectedDoubt.subject && <span>Subject: {selectedDoubt.subject}</span>}
                    {selectedDoubt.techStack && <span>Tech: {selectedDoubt.techStack}</span>}
                  </div>
                </div>

                {/* Answers */}
                {selectedDoubt.answers && selectedDoubt.answers.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Answers</h3>
                    {selectedDoubt.answers.map(answer => (
                      <div key={answer.id} className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-emerald-800">{answer.mentorName}</p>
                          <span className="text-xs text-slate-500">{formatDate(answer.createdAt)}</span>
                        </div>
                        <p className="text-slate-700 mb-3">{answer.answer}</p>
                        {answer.resources && (
                          <p className="text-sm text-slate-500 mb-3">📚 Resources: {answer.resources}</p>
                        )}
                        {answer.voiceNoteUrl && (
                          <div className="mb-3">
                            <audio controls className="w-full">
                              <source src={answer.voiceNoteUrl} type="audio/wav" />
                              <source src={answer.voiceNoteUrl} type="audio/mp3" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}
                        {answer.attachments && (
                          <div className="mb-3">
                            <p className="text-sm text-slate-500 mb-2">📎 Attachments:</p>
                            {Array.isArray(JSON.parse(answer.attachments || '[]')) && 
                              JSON.parse(answer.attachments).map((file, index) => (
                                <div key={index} className="flex items-center gap-2 mb-1">
                                  <Paperclip size={14} />
                                  <a 
                                    href={file.url} 
                                    download={file.name}
                                    className="text-sky-600 hover:text-sky-700 text-sm underline"
                                  >
                                    {file.name}
                                  </a>
                                </div>
                              ))
                            }
                          </div>
                        )}
                        {selectedDoubt.status === 'answered' && (
                          <div className="mt-4 pt-4 border-t border-emerald-200">
                            <p className="text-sm text-slate-500 mb-2">Was this answer helpful?</p>
                            <div className="flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  key={star}
                                  className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                  onClick={() => handleRating(answer.id, star)}
                                >
                                  <Star size={20} fill={answer.rating >= star ? 'currentColor' : 'none'} />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedDoubt.status === 'open' && (
                  <div className="mt-6 p-4 bg-yellow-600/10 border-l-4 border-yellow-500 rounded">
                    <p className="text-yellow-300">⏳ Waiting for mentor's response...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
