import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { entriesAPI } from '../../api/client';
import { Save, X } from 'lucide-react';

export default function CreateEntry() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [resources, setResources] = useState([]);
  const [resourceInput, setResourceInput] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const addResource = () => {
    if (resourceInput.trim() && !resources.includes(resourceInput.trim())) {
      setResources([...resources, resourceInput.trim()]);
      setResourceInput('');
    }
  };

  const removeResource = (resource) => {
    setResources(resources.filter(r => r !== resource));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const createData = { title, body, tags, resources };
      if (deadline) {
        createData.deadline = deadline;
      }
      await entriesAPI.create(createData);
      navigate('/student/entries');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gradient-to-br from-purple-800/50 to-indigo-800/50 backdrop-blur-xl border border-purple-600/50 rounded-xl shadow-lg p-6">
          <h1 className="text-4xl font-bold text-white mb-2">Create Learning Entry</h1>
          <p className="text-purple-200">Document your learning progress and insights</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did you learn today?"
              className="w-full px-4 py-3 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border border-white/20 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your learning notes, doubts, or questions here..."
              rows="8"
              className="w-full px-4 py-3 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border border-white/20 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Deadline (Optional)</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-slate-500 mt-2">Set a deadline for MCQ questions to become available</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="e.g., React, DSA, HTML"
                className="flex-1 px-4 py-3 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border border-white/20 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag} className="bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 rounded-full text-sm border border-purple-200 backdrop-blur-sm">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-purple-800 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Resources (URLs)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={resourceInput}
                onChange={(e) => setResourceInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
                placeholder="https://example.com"
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="button"
                onClick={addResource}
                className="px-3 py-1 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 rounded-full text-sm border border-purple-200 backdrop-blur-sm"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {resources.map(resource => (
                <div key={resource} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <a href={resource} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm truncate transition-colors">
                    {resource}
                  </a>
                  <button
                    type="button"
                    onClick={() => removeResource(resource)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? 'Creating...' : 'Create Entry'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/student/entries')}
              className="bg-gradient-to-r from-slate-100/80 to-slate-200/60 hover:from-slate-200/80 hover:to-slate-300/60 text-slate-900 px-4 py-2 rounded-lg transition-all duration-300 border border-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
