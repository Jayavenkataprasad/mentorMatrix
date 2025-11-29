import React, { useState, useEffect } from 'react';
import { MessageCircle, CheckCircle, AlertCircle, Send, X, Filter, Eye } from 'lucide-react';
import { api } from '../../api/client.js';
import Navbar from '../../components/Navbar';

export default function DoubtsQAEnhanced() {
  const [doubts, setDoubts] = useState([]);
  const [taskQuestions, setTaskQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('doubts');
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [doubtSubTab, setDoubtSubTab] = useState('open'); // New sub-tab for doubts
  const [answerText, setAnswerText] = useState('');
  const [resources, setResources] = useState('');

  useEffect(() => {
    fetchData();
  }, [filterStatus, activeTab, doubtSubTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'doubts') {
        // Use sub-tab filter if not "all", otherwise use regular filter
        const params = doubtSubTab !== 'all' ? { status: doubtSubTab } : {};
        const response = await api.get('/doubts', { params });
        setDoubts(response.data);
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
    if (!answerText.trim()) {
      alert('Please enter an answer');
      return;
    }

    try {
      await api.post(`/doubts/${selectedItem.id}/answers`, {
        answer: answerText,
        resources: resources || null
      });
      setAnswerText('');
      setResources('');
      
      // If we're on the "open" tab, switch to "answered" tab to show the answered doubt
      if (doubtSubTab === 'open') {
        setDoubtSubTab('answered');
      } else {
        fetchData();
      }
      
      setSelectedItem(null);
      alert('Answer submitted successfully!');
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer');
    }
  };

  const handleResolveDoubt = async (id, status) => {
    try {
      await api.patch(`/doubts/${id}/status`, { status });
      
      // Switch to appropriate tab based on new status
      if (status === 'resolved') {
        setDoubtSubTab('resolved');
      } else if (status === 'answered') {
        setDoubtSubTab('answered');
      } else {
        fetchData();
      }
      
      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating doubt:', error);
      alert('Failed to update doubt');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: 'bg-red-100 text-red-800',
      answered: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      pending: 'bg-blue-100 text-blue-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
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
      default:
        return null;
    }
  };

  const items = activeTab === 'doubts' ? doubts : taskQuestions;
  const emptyMessage = activeTab === 'doubts' 
    ? 'No doubts to review' 
    : 'No task questions yet';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 px-4 sm:px-6 lg:p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Doubts & Questions
          </h1>
          <p className="text-gray-600 mt-2">Review and answer student doubts and task-related questions</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('doubts')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'doubts'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-600'
            }`}
          >
            <MessageCircle className="inline mr-2" size={20} />
            Student Doubts
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'questions'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-600'
            }`}
          >
            <AlertCircle className="inline mr-2" size={20} />
            Task Questions
          </button>
        </div>

        {/* Sub-tabs for Doubts */}
        {activeTab === 'doubts' && (
          <div className="flex gap-2 mb-6 border-b border-gray-200">
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
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <tab.icon className="inline mr-2" size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {activeTab === 'doubts' 
            ? ['all', 'open', 'answered', 'resolved'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))
            : ['all', 'pending', 'answered'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))
          }
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border-t-4 border-blue-600">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gapx-4 sm:px-6 lg:p-6">
            {/* List */}
            <div className="lg:col-span-1">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {items.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-4 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${
                      selectedItem?.id === item.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-blue-600'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xl">
                        {activeTab === 'doubts' ? '❓' : '📋'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate text-sm">
                          {item.question}
                        </p>
                        <p className="text-xs opacity-75 mt-1">
                          {activeTab === 'doubts' ? item.studentName : item.taskTitle}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detail */}
            {selectedItem && (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 lg:p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold">{selectedItem.question}</h2>
                        <p className="text-blue-100 mt-2">
                          {activeTab === 'doubts' 
                            ? `From: ${selectedItem.studentName}`
                            : `Task: ${selectedItem.taskTitle}`}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getStatusBadge(selectedItem.status)}`}>
                        {getStatusIcon(selectedItem.status)}
                        {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-4 sm:px-6 lg:p-6 space-y-4 max-h-96 overflow-y-auto">
                    {/* Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {activeTab === 'doubts' && (
                        <>
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-semibold">Concept:</span> {selectedItem.concept}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Description:</span> {selectedItem.description}
                          </p>
                        </>
                      )}
                      {activeTab === 'questions' && (
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Task:</span> {selectedItem.taskTitle}
                        </p>
                      )}
                    </div>

                    {/* Existing Answers */}
                    {activeTab === 'doubts' && selectedItem.answers && selectedItem.answers.length > 0 && (
                      <div className="border-t pt-4">
                        <h3 className="font-bold text-gray-900 mb-3">Your Answers</h3>
                        <div className="space-y-3">
                          {selectedItem.answers.map(answer => (
                            <div key={answer.id} className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                              <p className="text-gray-700">{answer.answer}</p>
                              {answer.resources && (
                                <p className="text-sm text-gray-600 mt-2">📚 Resources: {answer.resources}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'questions' && selectedItem.answer && (
                      <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                        <p className="font-semibold text-green-900 mb-2">Your Answer</p>
                        <p className="text-gray-700">{selectedItem.answer}</p>
                      </div>
                    )}

                    {/* Answer Form */}
                    {activeTab === 'doubts' && selectedItem.status !== 'resolved' && (
                      <div className="border-t pt-4">
                        <h3 className="font-bold text-gray-900 mb-3">Add Answer</h3>
                        <div className="space-y-3">
                          <textarea
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            placeholder="Type your answer here..."
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                            rows="3"
                          />
                          <input
                            type="text"
                            value={resources}
                            onChange={(e) => setResources(e.target.value)}
                            placeholder="Resources (optional)"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleAnswerDoubt}
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg hover:shadow-lg font-semibold flex items-center justify-center gap-2"
                            >
                              <Send size={18} />
                              Submit Answer
                            </button>
                            {selectedItem.status === 'answered' && (
                              <button
                                onClick={() => handleResolveDoubt(selectedItem.id, 'resolved')}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg hover:shadow-lg font-semibold flex items-center justify-center gap-2"
                              >
                                <CheckCircle size={18} />
                                Mark Resolved
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'questions' && selectedItem.status === 'pending' && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-600">Waiting for student's answer...</p>
                      </div>
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
