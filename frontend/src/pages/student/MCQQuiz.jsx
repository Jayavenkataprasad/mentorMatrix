import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { mcqAPI } from '../../api/client';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Send } from 'lucide-react';

export default function MCQQuiz() {
  const { id: entryId } = useParams();
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  
  const [entry, setEntry] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [previousResults, setPreviousResults] = useState(null);
  const [showPreviousResults, setShowPreviousResults] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    // Reset fetch flag when entryId changes
    if (entryId !== hasFetched.current?.entryId) {
      hasFetched.current = { entryId, fetched: false };
    }
    
    // Check if this quiz was already attempted (localStorage for immediate feedback)
    const attemptedQuizzes = JSON.parse(localStorage.getItem('attemptedQuizzes') || '[]');
    if (attemptedQuizzes.includes(parseInt(entryId))) {
      setError('You have already attempted this quiz. You can only take it once.');
      setLoading(false);
      return;
    }
    
    // Only fetch data if entryId is valid and we haven't fetched yet
    if (entryId && entryId !== 'undefined' && entryId !== undefined && !hasFetched.current.fetched) {
      hasFetched.current.fetched = true;
      
      const fetchQuizData = async () => {
        // Validate entryId before making API call
        if (!entryId || entryId === 'undefined' || entryId === undefined) {
          console.error('Invalid entryId:', entryId);
          setError('Invalid entry ID. Please navigate to the quiz from your entries page.');
          setLoading(false);
          return;
        }

        try {
          console.log(`MCQQuiz: Fetching quiz data for entry ${entryId}`);
          
          const questionsResponse = await mcqAPI.getQuestionsForStudent(entryId);
          console.log('MCQQuiz: API Response:', questionsResponse);
          
          const questionsData = questionsResponse.data;
          console.log(`MCQQuiz: Received ${questionsData.length} questions`);
          
          if (questionsData.length === 0) {
            console.log('MCQQuiz: No questions found for this entry');
            
            // Check if it's because of deadline or no questions
            const now = new Date();
            const deadlineCheck = questionsResponse.config?.params?.deadline;
            
            let errorMessage = 'No questions available for this quiz.';
            let suggestions = [];
            
            if (deadlineCheck && new Date(deadlineCheck) > now) {
              errorMessage = 'Quiz questions are not available yet.';
              suggestions.push('The deadline for this quiz has not been reached.');
              suggestions.push('Please check back after the deadline.');
            } else {
              suggestions.push('Your mentor may not have added any questions yet.');
              suggestions.push('Contact your mentor to add MCQ questions for this entry.');
            }
            
            suggestions.push('Make sure you are logged in as the correct student.');
            suggestions.push('Verify that this entry belongs to you.');
            
            setError({
              message: errorMessage,
              suggestions: suggestions
            });
            setLoading(false);
            return;
          }

          console.log('MCQQuiz: Setting questions in state...');
          setQuestions(questionsData);
          
          // Initialize answers with null values
          const initialAnswers = {};
          questionsData.forEach(q => {
            initialAnswers[q.id] = null;
          });
          setAnswers(initialAnswers);

          // Set time limit (30 seconds per question)
          setTimeLeft(questionsData.length * 30);
          console.log('MCQQuiz: Quiz data loaded successfully');
        } catch (error) {
          console.error('MCQQuiz: Error fetching quiz data:', error);
          console.error('MCQQuiz: Error response:', error.response);
          
          if (error.response?.status === 403) {
            const errorMessage = error.response.data.error || 'Access denied';
            console.log('MCQQuiz: 403 Error -', errorMessage);
            
            if (errorMessage.includes('deadline')) {
              setError(errorMessage);
            } else if (errorMessage.includes('already attempted')) {
              setError('You have already attempted this quiz. You can only take it once.');
              // Fetch previous results
              fetchPreviousResults();
              // Also update localStorage for consistency
              const attemptedQuizzes = JSON.parse(localStorage.getItem('attemptedQuizzes') || '[]');
              if (!attemptedQuizzes.includes(parseInt(entryId))) {
                attemptedQuizzes.push(parseInt(entryId));
                localStorage.setItem('attemptedQuizzes', JSON.stringify(attemptedQuizzes));
              }
            } else {
              setError(errorMessage);
            }
          } else if (error.response?.status === 404) {
            setError('Entry not found. Please check if this entry belongs to you and try again.');
          } else if (error.response?.status === 500) {
            setError('Server error occurred while loading questions. Please try again later.');
          } else {
            setError('Failed to load questions. Please check your internet connection and try again.');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchQuizData();
    } else {
      if (!entryId || entryId === 'undefined' || entryId === undefined) {
        setError('Invalid entry ID. Please navigate to the quiz from your entries page.');
        setLoading(false);
      }
    }
  }, [entryId]);

  const fetchPreviousResults = async () => {
    try {
      console.log('MCQQuiz: Fetching previous results for entry', entryId);
      const response = await mcqAPI.getMyAnswers(entryId);
      console.log('MCQQuiz: Previous results:', response.data);
      
      if (response.data && response.data.length > 0) {
        setPreviousResults(response.data);
        setShowPreviousResults(true);
      }
    } catch (error) {
      console.error('MCQQuiz: Error fetching previous results:', error);
    }
  };

  useEffect(() => {
    let timer;
    if (timeLeft > 0 && !submitted) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !submitted) {
      handleSubmit();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, submitted]);

  const handleAnswerChange = (questionId, selectedAnswer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedAnswer
    }));
  };

  const handleSubmit = async () => {
    // Validate entryId before submitting
    if (!entryId || entryId === 'undefined' || entryId === undefined) {
      setError('Invalid entry ID. Cannot submit quiz.');
      return;
    }

    // Check if all questions are answered
    const unansweredQuestions = Object.keys(answers).filter(qid => answers[qid] === null);
    if (unansweredQuestions.length > 0 && !window.confirm(`You have ${unansweredQuestions.length} unanswered questions. Submit anyway?`)) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const answersArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId: parseInt(questionId),
        selectedAnswer
      }));

      console.log('MCQQuiz: Submitting answers:', { entryId, answersArray });
      console.log('MCQQuiz: Answers object:', answers);

      // Validate that we have answers to submit
      if (answersArray.length === 0) {
        setError('No answers to submit. Please answer at least one question.');
        return;
      }

      // Check if all answers are null (no selection made)
      const validAnswers = answersArray.filter(answer => answer.selectedAnswer !== null);
      if (validAnswers.length === 0) {
        setError('Please select an answer for at least one question before submitting.');
        return;
      }

      const response = await mcqAPI.submitAnswers(entryId, { answers: validAnswers });
      console.log('MCQQuiz: Submit response:', response.data);
      setResults(response.data);
      setSubmitted(true);
      
      // Immediately mark this quiz as attempted in localStorage for instant feedback
      const attemptedQuizzes = JSON.parse(localStorage.getItem('attemptedQuizzes') || '[]');
      if (!attemptedQuizzes.includes(entryId)) {
        attemptedQuizzes.push(entryId);
        localStorage.setItem('attemptedQuizzes', JSON.stringify(attemptedQuizzes));
      }
      
      // Emit event to notify other components about quiz submission
      window.dispatchEvent(new CustomEvent('quizSubmitted', {
        detail: { entryId, score: response.data.totalPoints }
      }));
      
      console.log('MCQQuiz: Quiz submitted successfully, emitted quizSubmitted event');
    } catch (error) {
      console.error('MCQQuiz: Submit error:', error);
      console.error('MCQQuiz: Error response:', error.response?.data);
      setError(error.response?.data?.error || 'Failed to submit answers');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-slate-500 mt-4">Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isAlreadyAttempted = error.includes('already attempted');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:p-6">
          <div className="bg-gradient-to-br from-purple-800/50 to-indigo-800/50 backdrop-blur-xl border border-purple-600/50 rounded-xl p-8 shadow-sm">
            <div className={`${isAlreadyAttempted ? 'text-yellow-400' : 'text-red-600'} mb-4`}>
              {isAlreadyAttempted ? (
                <CheckCircle size={48} className="mx-auto" />
              ) : (
                <AlertCircle size={48} className="mx-auto" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {isAlreadyAttempted ? 'Quiz Already Attempted' : 'Quiz Not Available'}
            </h2>
            <p className={`${isAlreadyAttempted ? 'text-yellow-200' : 'text-red-700'} mb-6`}>{error}</p>
            
            {isAlreadyAttempted ? (
              <div className="text-left bg-gradient-to-br from-yellow-800/30 to-orange-800/30 backdrop-blur-sm rounded-lg p-4 mb-6 border border-yellow-600/50">
                <h3 className="text-white font-semibold mb-2">Quiz Status:</h3>
                <ul className="text-yellow-200 text-sm space-y-1">
                  <li>• You have successfully completed this quiz</li>
                  <li>• Quiz attempts are limited to one per entry</li>
                  <li>• Your results have been saved and submitted to your mentor</li>
                  <li>• You can view your score in the quiz results section</li>
                </ul>
              </div>
            ) : (
              <div className="text-left bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white/20">
                <h3 className="text-white font-semibold mb-2">Troubleshooting Tips:</h3>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• Make sure you are logged in as the correct student</li>
                  <li>• Check if this entry belongs to your account</li>
                  <li>• Verify that the deadline has passed</li>
                  <li>• Ensure your mentor has added questions for this entry</li>
                  <li>• Try refreshing the page and logging in again</li>
                </ul>
              </div>
            )}
            
            <div className="space-y-4">
              <button
                onClick={() => navigate('/student/entries')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Back to My Entries
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-br from-slate-100/80 to-slate-200/60 hover:from-slate-200/80 hover:to-slate-300/60 text-white px-6 py-3 rounded-lg transition-all duration-300 border border-slate-300"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted && results) {
    const percentage = questions.length > 0
      ? Math.round((results.totalPoints / questions.reduce((sum, q) => sum + q.points, 0)) * 100)
      : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:p-6">
          <div className="bg-gradient-to-br from-purple-800/50 to-indigo-800/50 backdrop-blur-xl border border-purple-600/50 rounded-xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 animate-bounce">
                <CheckCircle className="text-white" size={40} />
              </div>
              <h1 className="text-5xl font-bold text-white mb-3 animate-pulse">🎉 Congratulations! 🎉</h1>
              <h2 className="text-3xl font-bold text-purple-200 mb-4">You Completed the Quiz!</h2>
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full inline-block mb-4">
                <p className={`text-2xl font-bold`}>
                  Your Score: {results.totalPoints} / {questions.reduce((sum, q) => sum + q.points, 0)} ({percentage}%)
                </p>
              </div>
              <p className="text-purple-200 text-lg">
                {percentage >= 80 ? '🌟 Excellent work!' : 
                 percentage >= 60 ? '👍 Good job!' : 
                 '💪 Keep practicing!'}
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {results.results.map((result, index) => {
                const question = questions.find(q => q.id === result.questionId);
                return (
                  <div key={result.questionId} className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-white font-medium">Question {index + 1}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.isCorrect
                          ? 'bg-green-600/20 text-green-300 border-green-500'
                          : 'bg-red-600/20 text-red-300 border-red-500'
                      }`}>
                        {result.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <p className="text-purple-200 mb-3">{question.question}</p>

                    <div className="space-y-1">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium ${
                            optIndex === result.correctAnswer
                              ? 'bg-green-600 text-white'
                              : optIndex === result.selectedAnswer
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-600 text-gray-300'
                          }`}>
                            {optIndex === result.correctAnswer
                              ? '✓'
                              : optIndex === result.selectedAnswer
                              ? '✗'
                              : String.fromCharCode(65 + optIndex)}
                          </span>
                          <span
                            className={`text-sm ${
                              optIndex === result.selectedAnswer && !result.isCorrect
                                ? 'text-red-400'
                                : 'text-gray-300'
                            }`}
                          >
                            {option}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 text-sm text-slate-600">
                      Points earned: {result.pointsEarned} / {question.points}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-br from-blue-800/30 to-indigo-800/30 backdrop-blur-sm rounded-lg p-4 mb-6 border border-blue-600/50">
              <h3 className="text-white font-semibold mb-2">Quiz Status:</h3>
              <ul className="text-blue-200 text-sm space-y-1">
                <li>• This quiz has been completed and submitted</li>
                <li>• You cannot retake this quiz</li>
                <li>• Your results have been saved and sent to your mentor</li>
                <li>• The quiz will no longer appear in your entries list</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/student/entries')}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Back to Entries
              </button>
              <button
                onClick={() => navigate(`/student/entries/${entryId}`)}
                className="flex-1 bg-gradient-to-br from-slate-100/80 to-slate-200/60 hover:from-slate-200/80 hover:to-slate-300/60 text-white px-6 py-3 rounded-xl transition-all duration-300 border border-slate-300"
              >
                View Entry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/student/entries')}
            className="flex items-center gap-2 text-purple-300 hover:text-purple-200 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Entries
          </button>
        </div>

        {/* Debug Info */}
        <div className="mb-4 p-3 bg-gradient-to-br from-purple-800/50 to-indigo-800/50 backdrop-blur-xl border border-purple-600/50 rounded-lg">
          <p className="text-sm text-purple-200">
            Debug: loading={loading}, error={error ? 'yes' : 'no'}, questions={questions.length}, entryId={entryId}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-gradient-to-br from-red-900/50 to-orange-900/50 backdrop-blur-xl border border-red-600/50 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-400 mt-1" size={20} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Quiz Access Restricted</h3>
                <p className="text-red-200 mb-4">
                  {typeof error === 'string' ? error : error.message}
                </p>
                
                {/* Show suggestions if available */}
                {typeof error === 'object' && error.suggestions && (
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2">Suggestions:</h4>
                    <ul className="list-disc list-inside text-red-200 space-y-1">
                      {error.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Show Previous Results Button */}
                {typeof error === 'string' && error.includes('already attempted') && (
                  <button
                    onClick={() => setShowPreviousResults(!showPreviousResults)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm"
                  >
                    {showPreviousResults ? 'Hide' : 'Show'} Previous Results
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Previous Results Display */}
        {showPreviousResults && previousResults && (
          <div className="mb-6 bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-xl border border-green-600/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="text-green-400" size={24} />
              <h3 className="text-xl font-semibold text-white">Previous Quiz Results</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-800/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {previousResults.filter(r => r.isCorrect).length}/{previousResults.length}
                </div>
                <div className="text-green-200 text-sm">Correct Answers</div>
              </div>
              <div className="bg-blue-800/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round((previousResults.filter(r => r.isCorrect).length / previousResults.length) * 100)}%
                </div>
                <div className="text-blue-200 text-sm">Score Percentage</div>
              </div>
              <div className="bg-purple-800/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {previousResults.reduce((sum, r) => sum + (r.points || 0), 0)}
                </div>
                <div className="text-purple-200 text-sm">Total Points</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-white mb-2">Answer Summary:</h4>
              {previousResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <span className="text-gray-300">Question {index + 1}</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    result.isCorrect 
                      ? 'bg-green-600/30 text-green-300' 
                      : 'bg-red-600/30 text-red-300'
                  }`}>
                    {result.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions */}
        {questions.length === 0 ? (
          <div className="bg-gradient-to-br from-purple-800/50 to-indigo-800/50 backdrop-blur-xl border border-purple-600/50 rounded-xl p-8 text-center">
            <AlertCircle className="mx-auto text-yellow-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-white mb-2">No Questions Available</h3>
            <p className="text-purple-200 mb-4">
              Your mentor hasn't added any MCQ questions for this entry yet, or the deadline hasn't been reached.
            </p>
            <button
              onClick={() => navigate('/student/entries')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Back to Entries
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-gradient-to-br from-purple-800/50 to-indigo-800/50 backdrop-blur-xl border border-purple-600/50 rounded-xl px-4 sm:px-6 lg:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 px-2 py-1 rounded-lg text-sm font-medium border border-purple-200 backdrop-blur-sm">
                        Question {index + 1}
                      </span>
                      <span className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-2 py-1 rounded-lg text-sm border border-blue-200 backdrop-blur-sm">
                        {question.points} points
                      </span>
                    </div>
                    <p className="text-white text-lg mb-4">{question.question}</p>

                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <label key={optIndex} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={optIndex}
                            checked={answers[question.id] === optIndex}
                            onChange={() => handleAnswerChange(question.id, optIndex)}
                            className="w-4 h-4 text-blue-600 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border-white/20 focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="flex items-center gap-2 text-purple-200 group-hover:text-white transition-colors">
                            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-100/80 to-slate-200/60 flex items-center justify-center text-xs font-medium group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-300 border border-slate-300">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length !== questions.length}
            className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 ${
              submitting || Object.keys(answers).length !== questions.length
                ? 'bg-gradient-to-br from-slate-200/80 to-slate-300/60 text-slate-400 cursor-not-allowed border border-slate-400'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send size={20} />
                Submit Quiz ({Object.keys(answers).length}/{questions.length} questions answered)
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
