import React, { useState, useEffect } from 'react';
import { Plus, MessageCircle, CheckCircle, Clock, Trash2, Send, X } from 'lucide-react';
import { api } from '../../api/client.js';

export default function Doubts() {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    concept: '',
    question: '',
    description: '',
    taskId: ''
  });
  const [answerText, setAnswerText] = useState('');

  useEffect(() => {
    fetchDoubts();
  }, [filterStatus]);

  const fetchDoubts = async () => {
    try {
      setLoading(true);
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
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
      setFormData({ concept: '', question: '', description: '', taskId: '' });
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

  const getStatusBadge = (status) => {
    const badges = {
      open: 'bg-blue-100 text-blue-800',
      answered: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <Clock size={16} />;
      case 'answered':
        return <MessageCircle size={16} />;
      case 'resolved':
        return <CheckCircle size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Doubts
            </h1>
            <p className="text-gray-600 mt-2">Ask questions and get clarification from your mentor</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all"
          >
            <Plus size={20} />
            Ask a Doubt
          </button>
        </div>

        {/* Create Doubt Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-blue-600">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Ask a New Doubt</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateDoubt} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Concept/Topic"
                  value={formData.concept}
                  onChange={(e) => setFormData({...formData, concept: e.target.value})}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
                <input
                  type="text"
                  placeholder="Question Title"
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <textarea
                placeholder="Describe your doubt in detail..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                rows="4"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-semibold"
                >
                  Submit Doubt
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'open', 'answered', 'resolved'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Doubts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading doubts...</p>
          </div>
        ) : doubts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border-t-4 border-blue-600">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No doubts yet. Ask your first doubt!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {doubts.map(doubt => (
              <div
                key={doubt.id}
                onClick={() => setSelectedDoubt(doubt)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-l-4 border-blue-600 p-6 cursor-pointer transform hover:scale-102"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{doubt.question}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getStatusBadge(doubt.status)}`}>
                        {getStatusIcon(doubt.status)}
                        {doubt.status.charAt(0).toUpperCase() + doubt.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{doubt.description}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                        🎯 {doubt.concept}
                      </span>
                      <span>{new Date(doubt.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDoubt(doubt.id);
                    }}
                    className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedDoubt.question}</h2>
              <button
                onClick={() => setSelectedDoubt(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-gray-600 mb-2">{selectedDoubt.description}</p>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {selectedDoubt.concept}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(selectedDoubt.status)}`}>
                    {selectedDoubt.status}
                  </span>
                </div>
              </div>

              {/* Answers */}
              {selectedDoubt.answers && selectedDoubt.answers.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-bold text-gray-900 mb-3">Mentor's Answers</h3>
                  <div className="space-y-3">
                    {selectedDoubt.answers.map(answer => (
                      <div key={answer.id} className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                        <p className="font-semibold text-green-900 mb-2">{answer.mentorName}</p>
                        <p className="text-gray-700">{answer.answer}</p>
                        {answer.resources && (
                          <p className="text-sm text-gray-600 mt-2">📚 Resources: {answer.resources}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDoubt.status === 'open' && (
                <p className="text-center text-gray-500 py-4">Waiting for mentor's response...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
