import React, { useState, useEffect, useMemo } from 'react';
import { MessageCircle, CheckCircle, AlertCircle, Send, X, Filter, Bell, Zap, TrendingUp, Clock, User, Mic, Paperclip, Pause, Play } from 'lucide-react';
import { api } from '../../api/client.js';
import { PRIORITY_LEVELS } from '../../constants/subjects.js';
import { useRealtime } from '../../context/RealtimeContext.jsx';
import Navbar from '../../components/Navbar';

export default function DoubtsQAEnhanced() {
  const [doubts, setDoubts] = useState([]);
  const [taskQuestions, setTaskQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('doubts');
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [doubtSubTab, setDoubtSubTab] = useState('open'); // New sub-tab for doubts
  const [answerText, setAnswerText] = useState('');
  const [resources, setResources] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const { notifications } = useRealtime();

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  // File attachments state
  const [attachments, setAttachments] = useState([]);

  // Fetch data when filters or tab change
  useEffect(() => {
    fetchData();
  }, [filterStatus, filterPriority, filterType, activeTab, doubtSubTab]);

  // React to realtime doubt events to refresh list without polling
  const doubtEventsKey = useMemo(() => {
    const doubtEvents = notifications.filter(n =>
      n.type === 'doubt:created' ||
      n.type === 'doubt:answered' ||
      n.type === 'doubt:resolved'
    );
    if (doubtEvents.length === 0) return 0;
    return doubtEvents[0].id; // latest notification id
  }, [notifications]);

  useEffect(() => {
    if (!doubtEventsKey) return;
    // When a doubt event arrives, refresh current view
    if (activeTab === 'doubts') {
      fetchData();
    }
  }, [doubtEventsKey, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'doubts') {
        const params = {};
        // Apply sub-tab filter
        if (doubtSubTab !== 'all') {
          params.status = doubtSubTab;
        } else if (filterStatus !== 'all') {
          params.status = filterStatus;
        }
        if (filterPriority !== 'all') params.priority = filterPriority;
        if (filterType !== 'all') params.doubtType = filterType;
        
        const response = await api.get('/doubts', { params });
        setDoubts(response.data);
        
        // Count unread (open) doubts
        const unread = response.data.filter(d => d.status === 'open').length;
        setUnreadCount(unread);
      } else {
        const params = filterStatus !== 'all' ? { status: filterStatus } : {};
        const response = await api.get('/task-questions', { params });
        setTaskQuestions(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerDoubt = async () => {
    if (!answerText.trim() && !audioURL && attachments.length === 0) {
      alert('Please provide an answer, voice note, or attachment');
      return;
    }

    try {
      // Prepare attachments data
      const attachmentsData = attachments.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }));

      await api.post(`/doubts/${selectedItem.id}/answers`, {
        answer: answerText,
        resources: resources || null,
        voiceNoteUrl: audioURL || null,
        attachments: attachmentsData
      });

      // Reset form
      setAnswerText('');
      setResources('');
      setAudioURL('');
      setAttachments([]);
      setIsRecording(false);

      fetchData();
      setSelectedItem(null);
      alert('Answer submitted successfully!');
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setAudioChunks(chunks);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleResolveDoubt = async (id, status) => {
    try {
      await api.patch(`/doubts/${id}/status`, { status });
      fetchData();
      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating doubt:', error);
      alert('Failed to update doubt');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: 'bg-red-500/20 text-red-300 border-red-500/50',
      answered: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      resolved: 'bg-green-500/20 text-green-300 border-green-500/50',
      needs_more_explanation: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
      pending: 'bg-blue-500/20 text-blue-300 border-blue-500/50'
    };
    return badges[status] || 'bg-gray-500/20 text-gray-300';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-blue-500/20 text-blue-300',
      medium: 'bg-yellow-500/20 text-yellow-300',
      high: 'bg-red-500/20 text-red-300'
    };
    return badges[priority] || 'bg-gray-500/20 text-gray-300';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
      case 'pending':
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

  const items = activeTab === 'doubts' ? doubts : taskQuestions;
  const emptyMessage = activeTab === 'doubts' 
    ? 'No doubts to review' 
    : 'No task questions yet';

  const openDoubts = doubts.filter(d => d.status === 'open').length;
  const highPriorityDoubts = doubts.filter(d => d.priority === 'high' && d.status === 'open').length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 sm:px-6 lg:p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                💬 Doubts & Questions Dashboard
              </h1>
              <p className="text-purple-200">Review and answer student doubts and task-related questions</p>
            </div>
            <div className="relative">
              <Bell size={28} className={`text-purple-400 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-red-600/20 to-red-700/20 border border-red-500/30 rounded-xl p-4 transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-200 text-sm font-semibold">Open Doubts</p>
                  <p className="text-3xl font-bold text-red-300">{openDoubts}</p>
                </div>
                <AlertCircle size={32} className="text-red-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-600/20 to-orange-700/20 border border-orange-500/30 rounded-xl p-4 transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-200 text-sm font-semibold">High Priority</p>
                  <p className="text-3xl font-bold text-orange-300">{highPriorityDoubts}</p>
                </div>
                <Zap size={32} className="text-orange-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-500/30 rounded-xl p-4 transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm font-semibold">Resolved</p>
                  <p className="text-3xl font-bold text-green-300">{doubts.filter(d => d.status === 'resolved').length}</p>
                </div>
                <CheckCircle size={32} className="text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('doubts')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'doubts'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            <MessageCircle className="inline mr-2" size={20} />
            Student Doubts ({doubts.length})
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'questions'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            <AlertCircle className="inline mr-2" size={20} />
            Task Questions ({taskQuestions.length})
          </button>
        </div>

        {/* Sub-tabs for Doubts */}
        {activeTab === 'doubts' && (
          <div className="flex gap-2 mb-6 border-b border-slate-700">
            {[
              { key: 'open', label: 'Open', icon: AlertCircle },
              { key: 'answered', label: 'Answered', icon: MessageCircle },
              { key: 'resolved', label: 'Resolved', icon: CheckCircle },
              { key: 'all', label: 'All', icon: Filter }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setDoubtSubTab(tab.key)}
                className={`px-4 py-2 font-medium transition-all border-b-2 ${
                  doubtSubTab === tab.key
                    ? 'text-purple-300 border-purple-400'
                    : 'text-gray-400 border-transparent hover:text-gray-300'
                }`}
              >
                <tab.icon className="inline mr-2" size={16} />
                {tab.label}
                {tab.key === 'open' && unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {activeTab === 'doubts' && doubtSubTab === 'all' && (
            <>
              <div className="flex gap-2">
                <span className="text-purple-200 font-semibold self-center text-sm">Status:</span>
                {['all', 'open', 'answered', 'resolved'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
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
                <span className="text-purple-200 font-semibold self-center text-sm">Priority:</span>
                {['all', 'low', 'medium', 'high'].map(priority => (
                  <button
                    key={priority}
                    onClick={() => setFilterPriority(priority)}
                    className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                      filterPriority === priority
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <span className="text-purple-200 font-semibold self-center text-sm">Type:</span>
                {['all', 'concept', 'project'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                      filterType === type
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {type === 'all' ? 'All' : type === 'concept' ? '📚 Concept' : '🚀 Project'}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-gray-300 mt-4">Loading...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-lg p-12 text-center border border-purple-500/30">
            <MessageCircle size={48} className="mx-auto text-purple-400 mb-4" />
            <p className="text-gray-300 text-lg">{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gapx-4 sm:px-6 lg:p-6 transition-all duration-200">
            {/* List */}
            <div className="lg:col-span-1">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {items.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-4 rounded-xl cursor-pointer transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-2xl border ${
                      selectedItem?.id === item.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 shadow-lg'
                        : 'bg-slate-800 text-gray-300 border-slate-700 hover:border-purple-500'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xl">
                        {activeTab === 'doubts' ? getTypeIcon(item.doubtType) : '📋'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate text-sm">
                          {item.question}
                        </p>
                        <p className="text-xs opacity-75 mt-1">
                          {activeTab === 'doubts' ? item.studentName : item.taskTitle}
                        </p>
                        {activeTab === 'doubts' && item.priority === 'high' && (
                          <p className="text-xs text-red-300 mt-1">🔴 High Priority</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detail */}
            {selectedItem && (
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-2xl overflow-hidden border border-purple-500/30">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 lg:p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">
                          {activeTab === 'doubts' ? getTypeIcon(selectedItem.doubtType) : '📋'}
                        </span>
                        <div>
                          <h2 className="text-2xl font-bold">{selectedItem.question}</h2>
                          <p className="text-purple-100 mt-2">
                            {activeTab === 'doubts' 
                              ? `From: ${selectedItem.studentName}`
                              : `Task: ${selectedItem.taskTitle}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 border ${getStatusBadge(selectedItem.status)}`}>
                          {getStatusIcon(selectedItem.status)}
                          {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                        </span>
                        {activeTab === 'doubts' && selectedItem.priority && (
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityBadge(selectedItem.priority)}`}>
                            {selectedItem.priority.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-4 sm:px-6 lg:p-6 space-y-4 max-h-96 overflow-y-auto">
                    {/* Details */}
                    <div className="bg-slate-700/50 p-4 rounded-xl border border-purple-500/20">
                      {activeTab === 'doubts' && (
                        <>
                          <p className="text-sm text-gray-300 mb-3">{selectedItem.description}</p>
                          <div className="flex gap-2 flex-wrap">
                            {selectedItem.subject && (
                              <span className="bg-purple-600/40 text-purple-200 px-3 py-1 rounded-full text-xs font-semibold">
                                📖 {selectedItem.subject}
                              </span>
                            )}
                            {selectedItem.techStack && (
                              <span className="bg-blue-600/40 text-blue-200 px-3 py-1 rounded-full text-xs font-semibold">
                                ⚙️ {selectedItem.techStack}
                              </span>
                            )}
                            {selectedItem.projectName && (
                              <span className="bg-green-600/40 text-green-200 px-3 py-1 rounded-full text-xs font-semibold">
                                🎯 {selectedItem.projectName}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                      {activeTab === 'questions' && (
                        <p className="text-sm text-gray-300">
                          <span className="font-semibold">Task:</span> {selectedItem.taskTitle}
                        </p>
                      )}
                    </div>

                    {/* Existing Answers */}
                    {activeTab === 'doubts' && selectedItem.answers && selectedItem.answers.length > 0 && (
                      <div className="border-t border-purple-500/30 pt-4">
                        <h3 className="font-bold text-white mb-3">Your Answers</h3>
                        <div className="space-y-3">
                          {selectedItem.answers.map(answer => (
                            <div key={answer.id} className="bg-green-600/20 border-l-4 border-green-500 p-4 rounded">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-green-300 font-medium">Your Answer</p>
                                <span className="text-xs text-gray-400">{new Date(answer.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="text-gray-200 mb-3">{answer.answer}</p>
                              {answer.resources && (
                                <p className="text-sm text-gray-400 mb-3">📚 Resources: {answer.resources}</p>
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
                                  <p className="text-sm text-gray-400 mb-2">📎 Attachments:</p>
                                  {Array.isArray(JSON.parse(answer.attachments || '[]')) && 
                                    JSON.parse(answer.attachments).map((file, index) => (
                                      <div key={index} className="flex items-center gap-2 mb-1">
                                        <Paperclip size={14} />
                                        <a 
                                          href={file.url} 
                                          download={file.name}
                                          className="text-blue-400 hover:text-blue-300 text-sm underline"
                                        >
                                          {file.name}
                                        </a>
                                      </div>
                                    ))
                                  }
                                </div>
                              )}
                              {answer.rating > 0 && (
                                <div className="mt-3 pt-3 border-t border-green-700/30">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400">Student Rating:</span>
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map(star => (
                                        <Star 
                                          key={star} 
                                          size={16} 
                                          className={star <= answer.rating ? 'text-yellow-400 fill-current' : 'text-gray-500'}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  {answer.feedback && (
                                    <p className="text-sm text-gray-400 mt-2 italic">"{answer.feedback}"</p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timeline Strip */}
                    {activeTab === 'doubts' && (
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
                                  <p className="text-sm text-gray-300 mt-1">Student asked: {selectedItem.question}</p>
                                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                    <Clock size={12} />
                                    {formatTimestamp(selectedItem.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Answered */}
                            {selectedItem.answers && selectedItem.answers.length > 0 && selectedItem.answers.map((answer, idx) => (
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
                            {selectedItem.status === 'resolved' && (
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
                                      {formatTimestamp(selectedItem.updatedAt)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Pending next step */}
                            {selectedItem.status === 'open' && (
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
                    )}

                    {activeTab === 'questions' && selectedItem.answer && (
                      <div className="bg-green-600/20 border-l-4 border-green-500 p-4 rounded">
                        <p className="font-semibold text-green-300 mb-2">Student's Answer</p>
                        <p className="text-gray-200">{selectedItem.answer}</p>
                      </div>
                    )}

                    {/* Answer Form */}
                    {activeTab === 'doubts' && selectedItem.status !== 'resolved' && (
                      <div className="border-t border-purple-500/30 pt-4">
                        <h3 className="font-bold text-white mb-3">Add Answer</h3>
                        <div className="space-y-3">
                          <textarea
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            placeholder="Type your answer here..."
                            className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                            rows="3"
                          />

                          {/* Voice Recording */}
                          <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl">
                            {!isRecording ? (
                              <button
                                onClick={startRecording}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                              >
                                <Mic size={18} />
                                Record Voice
                              </button>
                            ) : (
                              <button
                                onClick={stopRecording}
                                className="flex items-center gap-2 bg-red-600 animate-pulse text-white px-4 py-2 rounded-lg transition-colors"
                              >
                                <Pause size={18} />
                Stop Recording
              </button>
            )}
            {audioURL && (
              <div className="flex items-center gap-2 flex-1">
                <audio controls src={audioURL} className="h-8 flex-1" />
                <button
                  onClick={() => setAudioURL('')}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
              <Paperclip size={18} />
              Attach Files
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-700/50 p-2 rounded-lg">
                    <span className="text-sm text-gray-300 truncate">{file.name}</span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            value={resources}
            onChange={(e) => setResources(e.target.value)}
            placeholder="Resources (optional)"
            className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAnswerDoubt}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-xl hover:shadow-lg font-semibold flex items-center justify-center gap-2"
            >
              <Send size={18} />
              Submit Answer
            </button>
            {selectedItem.status === 'answered' && (
              <button
                onClick={() => handleResolveDoubt(selectedItem.id, 'resolved')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl hover:shadow-lg font-semibold flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Mark Resolved
              </button>
            )}
            {selectedItem.status === 'needs_more_explanation' && (
              <button
                onClick={() => handleResolveDoubt(selectedItem.id, 'answered')}
                className="flex-1 bg-gradient-to-r from-orange-600 to-yellow-600 text-white py-2 rounded-xl hover:shadow-lg font-semibold flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                Re-answer
              </button>
            )}
          </div>
        </div>
      </div>
    )}

                    {activeTab === 'questions' && selectedItem.status === 'pending' && (
                      <p className="text-sm text-gray-400 text-center py-4">⏳ Waiting for student's answer...</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </>
  );
}
