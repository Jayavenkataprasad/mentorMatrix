import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Circle, Check, Calendar, BookOpen, MessageCircle, Clock, User, Plus, Filter, Search, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { tasksAPI } from '../../api/client';
import { useRealtime } from '../../context/RealtimeContext.jsx';

export default function StudentTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();
  const { notifications } = useRealtime();

  useEffect(() => {
    fetchTasks();
  }, []);

  // React to real-time task updates
  useEffect(() => {
    const taskEvents = notifications.filter(n => 
      n.type === 'task:completed' || n.type === 'task:question_added'
    );
    if (taskEvents.length > 0) {
      fetchTasks();
    }
  }, [notifications]);

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getAll();
      console.log('Fetched tasks:', response.data);
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (task) => {
    try {
      await tasksAPI.update(task.id, { completed: !task.completed });
      setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !task.completed } : t));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await tasksAPI.delete(id);
        setTasks(tasks.filter(t => t.id !== id));
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = (task.title && task.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'pending' && !task.completed) ||
                         (filterStatus === 'completed' && task.completed);
    return matchesSearch && matchesFilter;
  });

  const pendingTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <p className="text-purple-200 mt-4">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <BookOpen className="text-blue-400" />
            My Tasks
          </h1>
          <p className="text-purple-200">Track and complete your assigned learning tasks</p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search tasks..."
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
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={() => navigate('/student/task-questions')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
            >
              <MessageCircle size={20} />
              Task Questions
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Total Tasks</p>
                <p className="text-3xl font-bold text-white">{tasks.length}</p>
              </div>
              <BookOpen className="text-blue-400" size={32} />
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-400">{pendingTasks.length}</p>
              </div>
              <Circle className="text-yellow-400" size={32} />
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-400">{completedTasks.length}</p>
              </div>
              <CheckCircle2 className="text-green-400" size={32} />
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {!tasks || tasks.length === 0 || filteredTasks.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
              <BookOpen className="mx-auto text-gray-500 mb-4" size={48} />
              <p className="text-gray-400 text-lg">
                {searchTerm || filterStatus !== 'all' ? 'No tasks found matching your filters.' : 'No tasks assigned yet'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filters.' : 'Your mentor will assign tasks to help you learn'}
              </p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                className={`bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-700/30 transition-all ${
                  task.completed ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleComplete(task)}
                    className={`mt-1 transition-colors ${
                      task.completed ? 'text-green-400 hover:text-gray-400' : 'text-gray-400 hover:text-green-400'
                    }`}
                  >
                    {task.completed ? <Check size={24} /> : <Circle size={24} />}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className={`text-xl font-semibold mb-2 ${task.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                          {task.title || 'Untitled Task'}
                        </h3>
                        {task.description && (
                          <p className={`text-sm mb-3 ${task.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            Mentor ID: {task.mentorId}
                          </span>
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {task.completed && task.completedAt && (
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              Completed {new Date(task.completedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        {task.completed ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-300 border border-green-500">
                            Completed
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-600/20 text-yellow-300 border border-yellow-500">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                    {task.completed && (
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <p className="text-sm text-green-400 mb-2">✅ Task completed! Your mentor may add questions to assess your understanding.</p>
                        <button
                          onClick={() => navigate('/student/task-questions')}
                          className="text-sm bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 px-4 py-2 rounded-lg transition-colors border border-purple-500"
                        >
                          Check for Questions
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
