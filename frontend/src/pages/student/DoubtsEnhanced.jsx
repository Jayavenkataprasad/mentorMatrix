import React, { useState, useEffect } from 'react';
import { Plus, MessageCircle, CheckCircle, Clock, Trash2, X, AlertCircle, Zap, Mic, Play, Pause, Download } from 'lucide-react';
import { api } from '../../api/client.js';
import { SUBJECTS, TECH_STACKS, PRIORITY_LEVELS, DOUBT_TYPES, getAllSubjects } from '../../constants/subjects.js';

export default function DoubtsEnhanced() {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    doubtType: 'concept',
    concept: '',
    question: '',
    description: '',
    subject: '',
    techStack: '',
    projectName: '',
    priority: 'medium',
    taskId: ''
  });

  useEffect(() => {
    fetchDoubts();
  }, [filterStatus, filterType]);

  const fetchDoubts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterType !== 'all') params.doubtType = filterType;
      
      const response = await api.get('/doubts', { params });
      setDoubts(response.data);
    } catch (error) {
      console.error('Error fetching doubts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoubt = async (e) => {
    e.preventDefault();
    try {
      await api.post('/doubts', formData);
      setFormData({
        doubtType: 'concept',
        concept: '',
        question: '',
        description: '',
        subject: '',
        techStack: '',
        projectName: '',
        priority: 'medium',
        taskId: ''
      });
      setShowForm(false);
      fetchDoubts();
    } catch (error) {
      console.error('Error creating doubt:', error);
      alert('Failed to create doubt');
    }
  };

  const handleDeleteDoubt = async (id) => {
    if (confirm('Delete this doubt?')) {
      try {
        await api.delete(`/doubts/${id}`);
        fetchDoubts();
        setSelectedDoubt(null);
      } catch (error) {
        console.error('Error deleting doubt:', error);
        alert('Failed to delete doubt');
      }
    }
  };

  const handleNeedsMoreExplanation = async () => {
    try {
      await api.patch(`/doubts/${selectedDoubt.id}/needs-more`);
      setSelectedDoubt(prev => ({ ...prev, status: 'needs_more_explanation' }));
      fetchDoubts();
      alert('Marked as needing more explanation');
    } catch (error) {
      console.error('Error updating doubt:', error);
      alert('Failed to update doubt');
    }
  };

  const downloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return badges[priority] || 'bg-gray-100 text-gray-800';
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
    return type === 'project' ? '🚀' : '📚';
  };

  const formatTimestamp = (ts) => {
    if (!ts) return null;
    const d = new Date(ts);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              💡 My Doubts & Questions
            </h1>
            <p className="text-purple-200">Get clarity on concepts and projects from your mentor</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all font-semibold"
          >
            <Plus size={20} />
            Ask a Doubt
          </button>
        </div>

        {/* Create Doubt Form */}
        {showForm && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-2xl p-8 mb-8 border border-purple-500/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Ask Your Doubt</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white p-2 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateDoubt} className="space-y-6">
              {/* Doubt Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-purple-200 mb-3">
                  What type of doubt?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {DOUBT_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({...formData, doubtType: type.value})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.doubtType === type.value
                          ? 'bg-purple-600 border-purple-400 text-white'
                          : 'bg-slate-700 border-slate-600 text-gray-300 hover:border-purple-400'
                      }`}
                    >
                      <span className="text-2xl mr-2">{type.icon}</span>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-semibold text-purple-200 mb-3">
                  Select Subject/Topic
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                  required
                >
                  <option value="">Choose a subject...</option>
                  {Object.entries(SUBJECTS).map(([category, subjects]) => (
                    <optgroup key={category} label={category}>
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Tech Stack Selection */}
              <div>
                <label className="block text-sm font-semibold text-purple-200 mb-3">
                  Tech Stack (if applicable)
                </label>
                <select
                  value={formData.techStack}
                  onChange={(e) => setFormData({...formData, techStack: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="">Select tech stack (optional)</option>
                  {TECH_STACKS.map(stack => (
                    <option key={stack} value={stack}>
                      {stack}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Name (if project doubt) */}
              {formData.doubtType === 'project' && (
                <div>
                  <label className="block text-sm font-semibold text-purple-200 mb-3">
                    Project Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., E-commerce Platform, Chat Application"
                    value={formData.projectName}
                    onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              )}

              {/* Question Title */}
              <div>
                <label className="block text-sm font-semibold text-purple-200 mb-3">
                  Your Question
                </label>
                <input
                  type="text"
                  placeholder="What's your question?"
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-purple-200 mb-3">
                  Detailed Description
                </label>
                <textarea
                  placeholder="Provide more context about your doubt..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  rows="4"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-purple-200 mb-3">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {PRIORITY_LEVELS.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData({...formData, priority: level.value})}
                      className={`p-3 rounded-xl border-2 transition-all font-semibold ${
                        formData.priority === level.value
                          ? `${level.color} border-current`
                          : 'bg-slate-700 border-slate-600 text-gray-300 hover:border-purple-400'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:shadow-lg font-semibold transition-all"
                >
                  Submit Doubt
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-700 text-gray-300 py-3 rounded-xl hover:bg-slate-600 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <div className="flex gap-2">
            <span className="text-purple-200 font-semibold self-center">Status:</span>
            {['all', 'open', 'answered', 'resolved'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full font-semibold transition-all ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <span className="text-purple-200 font-semibold self-center">Type:</span>
            {['all', 'concept', 'project'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-full font-semibold transition-all ${
                  filterType === type
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {type === 'all' ? 'All' : type === 'concept' ? '📚 Concept' : '🚀 Project'}
              </button>
            ))}
          </div>
        </div>

        {/* Doubts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-gray-300 mt-4">Loading your doubts...</p>
          </div>
        ) : doubts.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-lg p-12 text-center border border-purple-500/30">
            <MessageCircle size={48} className="mx-auto text-purple-400 mb-4" />
            <p className="text-gray-300 text-lg">No doubts yet. Ask your first doubt!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {doubts.map(doubt => (
              <div
                key={doubt.id}
                onClick={() => setSelectedDoubt(doubt)}
                className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl shadow-lg hover:shadow-2xl transition-all border border-purple-500/30 p-6 cursor-pointer transform hover:scale-102"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(doubt.doubtType)}</span>
                      <h3 className="text-xl font-bold text-white">{doubt.question}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border ${getStatusBadge(doubt.status)}`}>
                        {getStatusIcon(doubt.status)}
                        {doubt.status.charAt(0).toUpperCase() + doubt.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-3">{doubt.description}</p>
                    <div className="flex gap-3 flex-wrap text-sm">
                      <span className="bg-purple-600/40 text-purple-200 px-3 py-1 rounded-full font-semibold">
                        📖 {doubt.subject}
                      </span>
                      {doubt.techStack && (
                        <span className="bg-blue-600/40 text-blue-200 px-3 py-1 rounded-full font-semibold">
                          ⚙️ {doubt.techStack}
                        </span>
                      )}
                      {doubt.projectName && (
                        <span className="bg-green-600/40 text-green-200 px-3 py-1 rounded-full font-semibold">
                          🎯 {doubt.projectName}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(doubt.priority)}`}>
                        {doubt.priority.toUpperCase()}
                      </span>
                      <span className="text-gray-400 text-xs self-center">
                        {new Date(doubt.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDoubt(doubt.id);
                    }}
                    className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedDoubt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto border border-purple-500/30">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getTypeIcon(selectedDoubt.doubtType)}</span>
                <h2 className="text-2xl font-bold">{selectedDoubt.question}</h2>
              </div>
              <button
                onClick={() => setSelectedDoubt(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-700/50 p-4 rounded-xl border border-purple-500/20">
                <p className="text-gray-300 mb-3">{selectedDoubt.description}</p>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-purple-600/40 text-purple-200 px-3 py-1 rounded-full text-sm font-semibold">
                    📖 {selectedDoubt.subject}
                  </span>
                  {selectedDoubt.techStack && (
                    <span className="bg-blue-600/40 text-blue-200 px-3 py-1 rounded-full text-sm font-semibold">
                      ⚙️ {selectedDoubt.techStack}
                    </span>
                  )}
                  {selectedDoubt.projectName && (
                    <span className="bg-green-600/40 text-green-200 px-3 py-1 rounded-full text-sm font-semibold">
                      🎯 {selectedDoubt.projectName}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(selectedDoubt.priority)}`}>
                    {selectedDoubt.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Answers */}
              {selectedDoubt.answers && selectedDoubt.answers.length > 0 && (
                <div className="border-t border-purple-500/30 pt-4">
                  <h3 className="font-bold text-white mb-3">Mentor's Answers</h3>
                  <div className="space-y-3">
                    {selectedDoubt.answers.map(answer => (
                      <div key={answer.id} className="bg-green-600/20 border-l-4 border-green-500 p-4 rounded">
                        <p className="font-semibold text-green-300 mb-2">{answer.mentorName}</p>
                        {answer.answer && <p className="text-gray-200 mb-3">{answer.answer}</p>}
                        
                        {/* Voice Note */}
                        {answer.voiceNoteUrl && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-400 mb-2 flex items-center gap-1">
                              <Mic size={14} />
                              Voice Note
                            </p>
                            <audio controls src={answer.voiceNoteUrl} className="w-full" />
                          </div>
                        )}

                        {/* File Attachments */}
                        {answer.attachments && JSON.parse(answer.attachments).length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-400 mb-2 flex items-center gap-1">
                              <Paperclip size={14} />
                              Attachments
                            </p>
                            <div className="space-y-2">
                              {JSON.parse(answer.attachments).map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-slate-700/50 p-2 rounded">
                                  <span className="text-sm text-gray-300 truncate">{file.name}</span>
                                  <button
                                    onClick={() => downloadFile(file)}
                                    className="text-blue-400 hover:text-blue-300"
                                  >
                                    <Download size={16} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {answer.resources && (
                          <p className="text-sm text-gray-400">📚 Resources: {answer.resources}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline Strip */}
              <div className="border-t border-purple-500/30 pt-4">
                <h3 className="font-bold text-white mb-3">Activity Timeline</h3>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-purple-600/30"></div>
                  <div className="space-y-4">
                    {/* Created */}
                    <div className="flex items-start gap-3">
                      <div className="relative z-10 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <MessageCircle size={16} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-3 transition-all duration-300 hover:bg-purple-600/30">
                          <p className="font-semibold text-purple-200">Doubt Created</p>
                          <p className="text-sm text-gray-300 mt-1">You asked: {selectedDoubt.question}</p>
                          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <Clock size={12} />
                            {formatTimestamp(selectedDoubt.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Answered */}
                    {selectedDoubt.answers && selectedDoubt.answers.length > 0 && selectedDoubt.answers.map((answer, idx) => (
                      <div key={answer.id} className="flex items-start gap-3">
                        <div className="relative z-10 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle size={16} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-3 transition-all duration-300 hover:bg-green-600/30">
                            <p className="font-semibold text-green-200">Answered</p>
                            <p className="text-sm text-gray-300 mt-1">Mentor responded</p>
                            {answer.resources && (
                              <p className="text-xs text-gray-400 mt-2">📚 Resources: {answer.resources}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                              <Clock size={12} />
                              {formatTimestamp(answer.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Resolved */}
                    {selectedDoubt.status === 'resolved' && (
                      <div className="flex items-start gap-3">
                        <div className="relative z-10 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle size={16} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-3 transition-all duration-300 hover:bg-blue-600/30">
                            <p className="font-semibold text-blue-200">Resolved</p>
                            <p className="text-sm text-gray-300 mt-1">Doubt marked as resolved</p>
                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                              <Clock size={12} />
                              {formatTimestamp(selectedDoubt.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pending next step */}
                    {selectedDoubt.status === 'open' && (
                      <div className="flex items-start gap-3 opacity-60">
                        <div className="relative z-10 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <Clock size={16} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-600/20 border border-gray-500/30 rounded-xl p-3">
                            <p className="font-semibold text-gray-300">Awaiting Answer</p>
                            <p className="text-sm text-gray-400 mt-1">Mentor will respond soon</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedDoubt.status === 'open' && (
                <p className="text-center text-gray-400 py-4">⏳ Waiting for mentor's response...</p>
              )}

              {selectedDoubt.status === 'answered' && (
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleNeedsMoreExplanation}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-yellow-600 text-white py-2 rounded-xl hover:shadow-lg font-semibold"
                  >
                    Needs More Explanation
                  </button>
                </div>
              )}

              {selectedDoubt.status === 'needs_more_explanation' && (
                <p className="text-center text-orange-400 py-4">⏳ Mentor will provide more explanation...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
