import React, { useState, useEffect } from 'react';
import { CheckCircle, Plus, Clock, User, BookOpen, AlertCircle, Play, X, Search, Filter } from 'lucide-react';
import { api } from '../../api/client.js';
import { useRealtime } from '../../context/RealtimeContext.jsx';
import Navbar from '../../components/Navbar';

export default function CompletedTasks() {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    questionType: 'text',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { notifications } = useRealtime();

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  // React to real-time task completion updates
  useEffect(() => {
    const taskEvents = notifications.filter(n => 
      n.type === 'task:completed' || n.type === 'task:question_added' || n.type === 'task:question_answered'
    );
    if (taskEvents.length > 0) {
      fetchCompletedTasks();
    }
  }, [notifications]);

  const fetchCompletedTasks = async () => {
    try {
      const response = await api.get('/tasks/completed');
      setCompletedTasks(response.data);
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async () => {
    try {
      const questionData = {
        taskId: selectedTask.id,
        studentId: selectedTask.studentId,
        questionType: questionForm.questionType,
        question: questionForm.question,
        ...(questionForm.questionType === 'mcq' ? {
          options: JSON.stringify(questionForm.options),
          correctAnswer: questionForm.correctAnswer
        } : {
          answer: null // For text questions, mentor will evaluate later
        })
      };

      await api.post('/task-questions', questionData);
      
      // Reset form
      setQuestionForm({
        questionType: 'text',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: ''
      });
      setShowQuestionForm(false);
      setSelectedTask(null);
      
      // Refresh tasks
      fetchCompletedTasks();
      
      alert('Question added successfully!');
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question');
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

  const filteredTasks = completedTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         task.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'with-questions' && task.questions && task.questions.length > 0) ||
                         (filterStatus === 'no-questions' && (!task.questions || task.questions.length === 0));
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <p className="text-purple-200 mt-4">Loading completed tasks...</p>
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <CheckCircle className="text-green-400" />
            Completed Tasks
          </h1>
          <p className="text-purple-200">Review and assess student completed tasks</p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search completed tasks..."
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
              <option value="all">All Tasks</option>
              <option value="with-questions">With Questions</option>
              <option value="no-questions">No Questions</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 sm:px-6 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Total Completed</p>
                <p className="text-3xl font-bold text-white">{completedTasks.length}</p>
              </div>
              <CheckCircle className="text-green-400" size={32} />
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 sm:px-6 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">With Questions</p>
                <p className="text-3xl font-bold text-blue-400">
                  {completedTasks.filter(t => t.questions && t.questions.length > 0).length}
                </p>
              </div>
              <BookOpen className="text-blue-400" size={32} />
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 sm:px-6 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Answered Questions</p>
                <p className="text-3xl font-bold text-green-400">
                  {completedTasks.reduce((total, task) => 
                    total + (task.questions ? task.questions.filter(q => q.status === 'answered').length : 0), 0
                  )}
                </p>
              </div>
              <AlertCircle className="text-green-400" size={32} />
            </div>
          </div>
        </div>

        {/* Completed Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
              <CheckCircle className="mx-auto text-gray-500 mb-4" size={48} />
              <p className="text-gray-400 text-lg">
                {searchTerm || filterStatus !== 'all' ? 'No completed tasks found matching your filters.' : 'No completed tasks yet'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filters.' : 'Students will appear here when they complete tasks'}
              </p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 sm:px-6 lg:p-6 hover:bg-slate-700/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen className="text-blue-400" size={20} />
                      <h3 className="text-white font-semibold text-lg">{task.title}</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-300 border border-green-500">
                        Completed
                      </span>
                    </div>
                    <p className="text-gray-300 mb-3">{task.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {task.studentName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        Completed {formatDate(task.completedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertCircle size={14} />
                        {task.questions?.length || 0} questions
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Play size={16} />
                      Ask Questions
                    </button>
                  </div>
                </div>

                {/* Questions Preview */}
                {task.questions && task.questions.length > 0 && (
                  <div className="border-t border-slate-700 pt-4 mt-4">
                    <p className="text-sm text-gray-400 mb-2">
                      {task.questions.filter(q => q.status === 'answered').length} of {task.questions.length} questions answered
                    </p>
                    <div className="space-y-2">
                      {task.questions.slice(0, 2).map(question => (
                        <div key={question.id} className="bg-slate-700/30 p-3 rounded">
                          <p className="text-gray-300 text-sm">{question.question}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Status: {question.status === 'answered' ? '✓ Answered' : '⏳ Pending'}
                          </p>
                        </div>
                      ))}
                      {task.questions.length > 2 && (
                        <p className="text-xs text-gray-400 text-center">...and {task.questions.length - 2} more</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Question Form Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 sm:px-6 lg:p-6 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-4 sm:px-6 lg:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Ask Questions - {selectedTask.title}
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedTask(null);
                      setShowQuestionForm(false);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                {!showQuestionForm ? (
                  <div className="space-y-4">
                    <div className="bg-slate-700/30 p-4 rounded">
                      <h3 className="font-semibold text-white mb-2">Task Details</h3>
                      <p className="text-gray-300 mb-2">{selectedTask.description}</p>
                      <p className="text-sm text-gray-400">
                        Student: {selectedTask.studentName} | 
                        Completed: {formatDate(selectedTask.completedAt)}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowQuestionForm(true)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Add Question
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Question Type */}
                    <div>
                      <label className="block text-purple-200 mb-2 font-semibold">Question Type</label>
                      <select
                        value={questionForm.questionType}
                        onChange={(e) => setQuestionForm({...questionForm, questionType: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="text">Text Question</option>
                        <option value="mcq">Multiple Choice Question</option>
                      </select>
                    </div>

                    {/* Question */}
                    <div>
                      <label className="block text-purple-200 mb-2 font-semibold">Question</label>
                      <textarea
                        value={questionForm.question}
                        onChange={(e) => setQuestionForm({...questionForm, question: e.target.value})}
                        placeholder="Enter your question here..."
                        className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        rows="3"
                      />
                    </div>

                    {/* MCQ Options */}
                    {questionForm.questionType === 'mcq' && (
                      <>
                        <div>
                          <label className="block text-purple-200 mb-2 font-semibold">Options</label>
                          {questionForm.options.map((option, index) => (
                            <input
                              key={index}
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...questionForm.options];
                                newOptions[index] = e.target.value;
                                setQuestionForm({...questionForm, options: newOptions});
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + index)}`}
                              className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 mb-2"
                            />
                          ))}
                        </div>

                        <div>
                          <label className="block text-purple-200 mb-2 font-semibold">Correct Answer</label>
                          <select
                            value={questionForm.correctAnswer}
                            onChange={(e) => setQuestionForm({...questionForm, correctAnswer: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
                          >
                            <option value="">Select correct option</option>
                            {questionForm.options.map((option, index) => (
                              option && <option key={index} value={option}>{String.fromCharCode(65 + index)}: {option}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleQuestionSubmit}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                      >
                        Add Question
                      </button>
                      <button
                        onClick={() => setShowQuestionForm(false)}
                        className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
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
