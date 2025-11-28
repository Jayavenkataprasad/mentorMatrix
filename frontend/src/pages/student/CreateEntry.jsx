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
      await entriesAPI.create({ title, body, tags, resources });
      navigate('/student/entries');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create Learning Entry</h1>
          <p className="text-purple-200">Document your learning progress and insights</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-xl shadow-2xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did you learn today?"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Description *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your learning notes, doubts, or questions here..."
              rows="8"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="e.g., React, DSA, HTML"
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag} className="bg-purple-600/20 text-purple-300 border border-purple-500 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-purple-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Resources (URLs)</label>
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
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {resources.map(resource => (
                <div key={resource} className="flex items-center justify-between bg-slate-700/30 p-3 rounded-lg border border-slate-600">
                  <a href={resource} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 text-sm truncate transition-colors">
                    {resource}
                  </a>
                  <button
                    type="button"
                    onClick={() => removeResource(resource)}
                    className="text-red-400 hover:text-red-300 transition-colors"
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
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl border border-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
