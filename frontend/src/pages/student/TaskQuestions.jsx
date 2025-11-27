import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, BookOpen, User, Plus, Edit, Save, X, Search, Filter } from 'lucide-react';
import { api } from '../../api/client.js';
import { useRealtime } from '../../context/RealtimeContext.jsx';

export default function TaskQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { notifications } = useRealtime();

  useEffect(() => {
    fetchQuestions();
  }, []);

  // React to real-time question updates
  useEffect(() => {
    const questionEvents = notifications.filter(n => 
      n.type === 'task:question_added' || n.type === 'task:question_answered'
    );
    if (questionEvents.length > 0) {
      fetchQuestions();
    }
  }, [notifications]);

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/task-questions');
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (questionId) => {
    try {
      const question = questions.find(q => q.id === questionId);
      const payload = question.questionType === 'mcq' 
        ? { studentAnswer: selectedOption }
        : { answer: answerText };

      await api.patch(`/task-questions/${questionId}/answer`, payload);
      
      // Reset form
      setEditingQuestion(null);
      setAnswerText('');
      setSelectedOption('');
      
      // Refresh questions
      fetchQuestions();
      
      alert('Answer submitted successfully!');
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer');
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

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-600/20 text-yellow-300 border-yellow-500',
      answered: 'bg-green-600/20 text-green-300 border-green-500'
    };
    return badges[status] || badges.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock size={14} />,
      answered: <CheckCircle size={14} />
    };
    return icons[status] || icons.pending;
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.taskTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'pending' && question.status === 'pending') ||
                         (filterStatus === 'answered' && question.status === 'answered');
    return matchesSearch && matchesFilter;
  });

  const pendingCount = filteredQuestions.filter(q => q.status === 'pending').length;
  const answeredCount = filteredQuestions.filter(q => q.status === 'answered').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <p className="text-purple-200 mt-4">Loading task questions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <BookOpen className="text-blue-400" />
            Task Questions
          </h1>
          <p className="text-purple-200">Answer questions from your mentor about completed tasks</p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Questions</option>
              <option value="pending">Pending</option>
              <option value="answered">Answered</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Total Questions</p>
                <p className="text-3xl font-bold text-white">{filteredQuestions.length}</p>
              </div>
              <BookOpen className="text-blue-400" size={32} />
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-400">{pendingCount}</p>
              </div>
              <Clock className="text-yellow-400" size={32} />
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Answered</p>
                <p className="text-3xl font-bold text-green-400">{answeredCount}</p>
              </div>
              <CheckCircle className="text-green-400" size={32} />
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {filteredQuestions.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
              <BookOpen className="mx-auto text-gray-500 mb-4" size={48} />
              <p className="text-gray-400 text-lg">
                {searchTerm || filterStatus !== 'all' ? 'No questions found matching your filters.' : 'No questions yet'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filters.' : 'Your mentor will add questions here when you complete tasks'}
              </p>
            </div>
          ) : (
            filteredQuestions.map(question => (
              <div
                key={question.id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-700/30 transition-all"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold text-lg">{question.taskTitle}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(question.status)}`}>
                        {getStatusIcon(question.status)}
                        <span className="ml-1">{question.status}</span>
                      </span>
                      {question.questionType === 'mcq' && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-300 border border-blue-500">
                          MCQ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {question.mentorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDate(question.createdAt)}
                      </span>
                    </div>
                  </div>
                  {question.status === 'pending' && (
                    <button
                      onClick={() => setEditingQuestion(question.id)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Edit size={16} />
                      Answer
                    </button>
                  )}
                </div>

                {/* Question Content */}
                <div className="bg-slate-700/30 p-4 rounded-lg mb-4">
                  <p className="text-gray-200 font-medium mb-2">Question:</p>
                  <p className="text-gray-300">{question.question}</p>
                </div>

                {/* MCQ Options */}
                {question.questionType === 'mcq' && question.options && (
                  <div className="mb-4">
                    <p className="text-gray-200 font-medium mb-2">Options:</p>
                    <div className="space-y-2">
                      {JSON.parse(question.options).map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-purple-400 font-medium">{String.fromCharCode(65 + index)}.</span>
                          <span className="text-gray-300">{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Answer Form */}
                {editingQuestion === question.id && (
                  <div className="border-t border-slate-600 pt-4">
                    <h4 className="text-white font-semibold mb-3">Your Answer:</h4>
                    
                    {question.questionType === 'mcq' ? (
                      <div className="space-y-2 mb-4">
                        {JSON.parse(question.options).map((option, index) => (
                          <label key={index} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option}
                              checked={selectedOption === option}
                              onChange={(e) => setSelectedOption(e.target.value)}
                              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-gray-300">
                              {String.fromCharCode(65 + index)}. {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        rows="4"
                      />
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleAnswerSubmit(question.id)}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Save size={18} />
                        Submit Answer
                      </button>
                      <button
                        onClick={() => {
                          setEditingQuestion(null);
                          setAnswerText('');
                          setSelectedOption('');
                        }}
                        className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Existing Answer */}
                {question.status === 'answered' && (
                  <div className="border-t border-slate-600 pt-4">
                    <h4 className="text-white font-semibold mb-3">Your Answer:</h4>
                    <div className="bg-green-600/20 border-l-4 border-green-500 p-4 rounded">
                      {question.questionType === 'mcq' ? (
                        <div>
                          <p className="text-gray-200 mb-2">Selected: {question.studentAnswer}</p>
                          {question.isCorrect === 1 ? (
                            <p className="text-green-400 flex items-center gap-2">
                              <CheckCircle size={16} />
                              Correct Answer!
                            </p>
                          ) : (
                            <p className="text-red-400 flex items-center gap-2">
                              <AlertCircle size={16} />
                              Incorrect. Correct answer: {question.correctAnswer}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-200">{question.answer}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Answered {formatDate(question.answeredAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
