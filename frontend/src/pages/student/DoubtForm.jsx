import React, { useState } from 'react';
import { Send, HelpCircle, AlertCircle, BookOpen, Code, Briefcase, Star } from 'lucide-react';
import { api } from '../../api/client.js';
import { SUBJECTS_FLAT, TECH_STACKS, PRIORITY_LEVELS, DOUBT_TYPES } from '../../constants/subjects.js';

export default function DoubtForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    concept: '',
    question: '',
    description: '',
    doubtType: 'concept',
    subject: '',
    techStack: '',
    projectName: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.concept.trim() || !formData.question.trim()) {
      alert('Please fill in the concept and question fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/doubts', formData);
      onSubmit && onSubmit();
    } catch (error) {
      console.error('Error submitting doubt:', error);
      alert('Failed to submit doubt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'concept':
        return <BookOpen size={16} />;
      case 'project':
        return <Briefcase size={16} />;
      default:
        return <HelpCircle size={16} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'text-blue-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800/60 border border-purple-500/30 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <HelpCircle className="text-purple-400" />
                Ask a Doubt
              </h2>
              <p className="text-purple-200">Get help from mentors on concepts and projects</p>
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <AlertCircle size={24} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Doubt Type */}
            <div>
              <label className="block text-purple-200 mb-2 font-semibold">Doubt Type</label>
              <div className="grid grid-cols-2 gap-4">
                {DOUBT_TYPES.map(type => (
                  <label
                    key={type.value}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.doubtType === type.value
                        ? 'border-purple-500 bg-purple-600/20'
                        : 'border-slate-600 bg-slate-700/50 hover:border-purple-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="doubtType"
                      value={type.value}
                      checked={formData.doubtType === type.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {getTypeIcon(type.value)}
                    <span className="text-white font-medium">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Concept */}
            <div>
              <label className="block text-purple-200 mb-2 font-semibold">
                Concept/Topic <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="concept"
                value={formData.concept}
                onChange={handleChange}
                placeholder="e.g., React Hooks, Data Structures, Machine Learning"
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            {/* Question */}
            <div>
              <label className="block text-purple-200 mb-2 font-semibold">
                Your Question <span className="text-red-400">*</span>
              </label>
              <textarea
                name="question"
                value={formData.question}
                onChange={handleChange}
                placeholder="Describe your doubt clearly..."
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                rows="4"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-purple-200 mb-2 font-semibold">Additional Details (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide more context about your doubt..."
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                rows="3"
              />
            </div>

            {/* Conditional Fields */}
            {formData.doubtType === 'concept' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject */}
                <div>
                  <label className="block text-purple-200 mb-2 font-semibold">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="">Select Subject</option>
                    {SUBJECTS_FLAT.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="block text-purple-200 mb-2 font-semibold">Tech Stack</label>
                  <select
                    name="techStack"
                    value={formData.techStack}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="">Select Tech Stack</option>
                    {TECH_STACKS.map(stack => (
                      <option key={stack} value={stack}>{stack}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {formData.doubtType === 'project' && (
              <div>
                <label className="block text-purple-200 mb-2 font-semibold">Project Name</label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  placeholder="e.g., E-commerce Website, Weather App"
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            )}

            {/* Priority */}
            <div>
              <label className="block text-purple-200 mb-2 font-semibold">Priority</label>
              <div className="grid grid-cols-3 gap-4">
                {PRIORITY_LEVELS.map(priority => (
                  <label
                    key={priority.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.priority === priority.value
                        ? 'border-purple-500 bg-purple-600/20'
                        : 'border-slate-600 bg-slate-700/50 hover:border-purple-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority.value}
                      checked={formData.priority === priority.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <AlertCircle size={16} className={getPriorityColor(priority.value)} />
                    <span className="text-white font-medium">{priority.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:shadow-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send size={20} />
                    Submit Doubt
                  </>
                )}
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 font-semibold transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
