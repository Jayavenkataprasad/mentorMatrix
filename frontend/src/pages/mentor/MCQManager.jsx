import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { mcqAPI } from '../../api/client';
import { Plus, Edit2, Trash2, Save, X, ArrowLeft, Clock, Users, CheckCircle } from 'lucide-react';

export default function MCQManager() {
  const { entryId } = useParams();
  const navigate = useNavigate();
  
  const [entry, setEntry] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 1
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEntryData();
  }, [entryId]);

  const fetchEntryData = async () => {
    try {
      // In a real implementation, you'd fetch entry details
      // For now, let's just fetch questions
      const questionsResponse = await mcqAPI.getQuestions(entryId);
      setQuestions(questionsResponse.data);
      
      const answersResponse = await mcqAPI.getStudentAnswers(entryId);
      setStudentAnswers(answersResponse.data);
    } catch (error) {
      console.error('Error fetching entry data:', error);
      setError('Failed to load entry data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    try {
      setError('');
      const validOptions = newQuestion.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        setError('At least 2 options are required');
        return;
      }

      const questionData = {
        ...newQuestion,
        options: validOptions
      };

      await mcqAPI.createQuestion(entryId, questionData);
      
      // Reset form
      setNewQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 1
      });
      
      // Refresh questions
      fetchEntryData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create question');
    }
  };

  const handleUpdateQuestion = async (questionId) => {
    try {
      setError('');
      const validOptions = editingQuestion.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        setError('At least 2 options are required');
        return;
      }

      const questionData = {
        ...editingQuestion,
        options: validOptions
      };

      await mcqAPI.updateQuestion(questionId, questionData);
      setEditingQuestion(null);
      fetchEntryData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update question');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await mcqAPI.deleteQuestion(questionId);
        fetchEntryData();
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to delete question');
      }
    }
  };

  const updateNewQuestionOption = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const updateEditingQuestionOption = (index, value) => {
    const updatedOptions = [...editingQuestion.options];
    updatedOptions[index] = value;
    setEditingQuestion({ ...editingQuestion, options: updatedOptions });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <p className="text-purple-200 mt-4">Loading MCQ questions...</p>
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
          <button
            onClick={() => navigate('/mentor/dashboard')}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">MCQ Questions Management</h1>
          <p className="text-purple-200">Create and manage MCQ questions for student assessment</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Questions Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Questions</h2>
              <span className="text-purple-300">{questions.length} questions</span>
            </div>

            {/* Create New Question */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Create New Question</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Question</label>
                  <textarea
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors h-20 resize-none"
                    placeholder="Enter your question..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Options</label>
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={newQuestion.correctAnswer === index}
                        onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: index })}
                        className="w-4 h-4 text-purple-600"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateNewQuestionOption(index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder={`Option ${index + 1}`}
                      />
                      {newQuestion.correctAnswer === index && (
                        <CheckCircle className="text-green-400" size={20} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Points</label>
                    <input
                      type="number"
                      min="1"
                      value={newQuestion.points}
                      onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 1 })}
                      className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleCreateQuestion}
                    className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Create Question
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Questions */}
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  {editingQuestion?.id === question.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <textarea
                        value={editingQuestion.question}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors h-20 resize-none"
                      />
                      
                      {editingQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`editCorrectAnswer${question.id}`}
                            checked={editingQuestion.correctAnswer === index}
                            onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: index })}
                            className="w-4 h-4 text-purple-600"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateEditingQuestionOption(index, e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                          />
                          {editingQuestion.correctAnswer === index && (
                            <CheckCircle className="text-green-400" size={20} />
                          )}
                        </div>
                      ))}

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={editingQuestion.points}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, points: parseInt(e.target.value) || 1 })}
                          className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        <span className="text-purple-300">points</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateQuestion(question.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Save size={16} />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingQuestion(null)}
                          className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-white font-medium">{question.question}</p>
                          <div className="mt-2 space-y-1">
                            {question.options.map((option, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium ${
                                  index === question.correctAnswer 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-slate-600 text-gray-300'
                                }`}>
                                  {index === question.correctAnswer ? '✓' : String.fromCharCode(65 + index)}
                                </span>
                                <span className="text-gray-300">{option}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className="text-purple-300 text-sm">{question.points} pts</span>
                          <button
                            onClick={() => setEditingQuestion(question)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Student Answers Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Student Answers</h2>
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {showAnswers ? 'Hide' : 'Show'} Answers
              </button>
            </div>

            {showAnswers && (
              <div className="space-y-4">
                {studentAnswers.length === 0 ? (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                    <Users className="mx-auto text-gray-500 mb-4" size={48} />
                    <p className="text-gray-400">No student answers yet</p>
                  </div>
                ) : (
                  studentAnswers.map((answer) => (
                    <div key={`${answer.questionId}-${answer.studentId}`} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">{answer.studentName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          answer.isCorrect 
                            ? 'bg-green-600/20 text-green-300 border-green-500' 
                            : 'bg-red-600/20 text-red-300 border-red-500'
                        }`}>
                          {answer.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      
                      <p className="text-purple-200 mb-2">{answer.question}</p>
                      
                      <div className="space-y-1 mb-3">
                        {answer.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium ${
                              index === answer.correctAnswer 
                                ? 'bg-green-600 text-white' 
                                : index === answer.selectedAnswer
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-600 text-gray-300'
                            }`}>
                              {index === answer.correctAnswer ? '✓' : 
                               index === answer.selectedAnswer ? '✗' : 
                               String.fromCharCode(65 + index)}
                            </span>
                            <span className={`text-sm ${
                              index === answer.selectedAnswer && !answer.isCorrect
                                ? 'text-red-400' 
                                : 'text-gray-300'
                            }`}>
                              {option}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-300">Points earned: {answer.points}</span>
                        <span className="text-gray-400">
                          Answered: {new Date(answer.answeredAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
