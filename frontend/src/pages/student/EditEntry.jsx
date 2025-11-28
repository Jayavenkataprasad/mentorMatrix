import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { entriesAPI } from '../../api/client';
import { Save, X, ArrowLeft } from 'lucide-react';

export default function EditEntry() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [resources, setResources] = useState([]);
  const [resourceInput, setResourceInput] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntry();
  }, [id]);

  const fetchEntry = async () => {
    try {
      const response = await entriesAPI.getById(id);
      const entry = response.data;
      setTitle(entry.title || '');
      setBody(entry.body || '');
      setTags(entry.tags || []);
      setResources(entry.resources || []);
      // Format deadline for datetime-local input
      if (entry.deadline) {
        const deadlineDate = new Date(entry.deadline);
        setDeadline(deadlineDate.toISOString().slice(0, 16));
      } else {
        setDeadline('');
      }
    } catch (error) {
      console.error('Failed to fetch entry:', error);
      setError('Failed to load entry');
    } finally {
      setLoading(false);
    }
  };

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
    setSaving(true);

    try {
      const updateData = { title, body, tags, resources };
      if (deadline) {
        updateData.deadline = deadline;
      }
      await entriesAPI.update(id, updateData);
      navigate('/student/entries');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update entry');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-slate-500 mt-4">Loading entry...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/student/entries')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Entries
          </button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Edit Learning Entry</h1>
          <p className="text-slate-500">Update your learning progress and insights</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Entry Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
              placeholder="What did you learn today?"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Learning Details
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors h-40 resize-none"
              placeholder="Describe what you learned, challenges faced, insights gained..."
              required
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Deadline (Optional)
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-slate-500 mt-2">Set a deadline for MCQ questions to become available</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-200 text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Resources & Links
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={resourceInput}
                onChange={(e) => setResourceInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
                className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Add a resource URL..."
              />
              <button
                type="button"
                onClick={addResource}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {resources.map((resource, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <a
                    href={resource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 truncate flex-1"
                  >
                    {resource}
                  </a>
                  <button
                    type="button"
                    onClick={() => removeResource(resource)}
                    className="text-red-600 hover:text-red-700 ml-2"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-800 disabled:to-blue-800 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Update Entry
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/student/entries')}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
