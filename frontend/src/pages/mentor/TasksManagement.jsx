import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Plus, Trash2, MessageCircle, Eye, X } from 'lucide-react';
import { api } from '../../api/client.js';
import Navbar from '../../components/Navbar';

export default function TasksManagement() {
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [questionText, setQuestionText] = useState('');
  const [formData, setFormData] = useState({
    studentId: '',
    title: '',
    description: '',
    dueDate: '',
    concept: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchStudents();
  }, [filterStatus]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      let filtered = response.data;
      
      if (filterStatus === 'pending') {
        filtered = filtered.filter(t => !t.completed);
      } else if (filterStatus === 'completed') {
        filtered = filtered.filter(t => t.completed);
      }
      
      setTasks(filtered);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/mentor/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', formData);
      setFormData({ studentId: '', title: '', description: '', dueDate: '', concept: '' });
      setShowForm(false);
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (confirm('Delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
      }
    }
  };

  const handleAskQuestion = async () => {
    if (!questionText.trim()) {
      alert('Please enter a question');
      return;
    }

    try {
      await api.post('/task-questions', {
        taskId: selectedTask.id,
        studentId: selectedTask.studentId,
        question: questionText
      });
      setQuestionText('');
      alert('Question sent to student!');
      setSelectedTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Failed to send question');
    }
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown';
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 sm:px-6 lg:p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Task Management
            </h1>
            <p className="text-purple-200 mt-2">Assign tasks and ask questions about completed tasks</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all"
          >
            <Plus size={20} />
            Assign Task
          </button>
        </div>

        {/* Create Task Form */}
        {showForm && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 sm:px-6 lg:p-6 mb-8 border-l-4 border-purple-600">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Assign New Task</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Concept/Topic"
                  value={formData.concept}
                  onChange={(e) => setFormData({...formData, concept: e.target.value})}
                  className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <input
                type="text"
                placeholder="Task Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
              <textarea
                placeholder="Task Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                rows="3"
              />
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl hover:shadow-lg font-semibold transition-all"
                >
                  Assign Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pending Tasks */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock size={28} className="text-orange-400" />
            Pending Tasks ({pendingTasks.length})
          </h2>
          {pendingTasks.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center border-t-4 border-orange-600">
              <Clock size={48} className="mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400">No pending tasks</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-700/30 transition-all border-l-4 border-orange-600 px-4 sm:px-6 lg:p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{task.title}</h3>
                      <p className="text-gray-300 mt-1">{task.description}</p>
                      <div className="flex gap-4 mt-3 text-sm text-gray-400 flex-wrap">
                        <span className="bg-blue-600/20 text-blue-300 border border-blue-500 px-3 py-1 rounded-full font-semibold">
                          👤 {getStudentName(task.studentId)}
                        </span>
                        {task.concept && (
                          <span className="bg-purple-600/20 text-purple-300 border border-purple-500 px-3 py-1 rounded-full font-semibold">
                            🎯 {task.concept}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="bg-red-600/20 text-red-300 border border-red-500 px-3 py-1 rounded-full font-semibold">
                            📅 {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-400 hover:text-red-300 p-2 hover:bg-red-600/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Tasks */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle size={28} className="text-green-400" />
            Completed Tasks ({completedTasks.length})
          </h2>
          {completedTasks.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center border-t-4 border-green-600">
              <CheckCircle size={48} className="mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400">No completed tasks yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {completedTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-700/30 transition-all border-l-4 border-green-600 px-4 sm:px-6 lg:p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{task.title}</h3>
                        <span className="bg-green-600/20 text-green-300 border border-green-500 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                          <CheckCircle size={16} />
                          Completed
                        </span>
                      </div>
                      <p className="text-gray-300 mt-1">{task.description}</p>
                      <div className="flex gap-4 mt-3 text-sm text-gray-400 flex-wrap">
                        <span className="bg-blue-600/20 text-blue-300 border border-blue-500 px-3 py-1 rounded-full font-semibold">
                          👤 {getStudentName(task.studentId)}
                        </span>
                        {task.concept && (
                          <span className="bg-purple-600/20 text-purple-300 border border-purple-500 px-3 py-1 rounded-full font-semibold">
                            🎯 {task.concept}
                          </span>
                        )}
                        <span className="bg-green-600/20 text-green-300 border border-green-500 px-3 py-1 rounded-full font-semibold">
                          ✅ {new Date(task.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
                    >
                      <MessageCircle size={18} />
                      Ask Questions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ask Questions Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 sm:px-6 lg:p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{selectedTask.title}</h2>
                <p className="text-purple-200 mt-1">Ask questions to verify learning</p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="px-4 sm:px-6 lg:p-6 space-y-4">
              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                <p className="text-gray-300 mt-1">
                  <span className="font-semibold">Student:</span> {getStudentName(selectedTask.studentId)}
                </p>
                <p className="text-gray-300 mt-1">
                  <span className="font-semibold">Concept:</span> {selectedTask.concept || 'Not specified'}
                </p>
                <p className="text-gray-300 mt-1">
                  <span className="font-semibold">Completed:</span> {new Date(selectedTask.completedAt).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Ask a Question to Verify Learning
                </label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Ask a question about the concept they learned..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  rows="4"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAskQuestion}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl hover:shadow-lg font-semibold flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  Send Question
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
