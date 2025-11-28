import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { entriesAPI, commentsAPI } from '../../api/client';
import { ArrowLeft, Send, Edit2, Save, X } from 'lucide-react';

export default function EntryDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [entry, setEntry] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(searchParams.get('edit') === 'true');
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntry();
    fetchComments();
  }, [id]);

  const fetchEntry = async () => {
    try {
      const response = await entriesAPI.getById(id);
      setEntry(response.data);
      setEditData(response.data);
    } catch (error) {
      console.error('Failed to fetch entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentsAPI.getAll(id);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await entriesAPI.update(id, {
        title: editData.title,
        body: editData.body,
        tags: editData.tags,
        resources: editData.resources,
      });
      setEntry(editData);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update entry:', error);
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

  if (!entry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
            <BookOpen className="mx-auto text-slate-400 mb-4" size={48} />
            <p className="text-slate-500 text-lg">Entry not found</p>
            <button
              onClick={() => navigate('/student/entries')}
              className="mt-4 text-blue-600 hover:text-blue-700 text-sm transition-colors"
            >
              Back to entries
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-600/20 text-yellow-300 border-yellow-500',
    reviewed: 'bg-blue-600/20 text-blue-300 border-blue-500',
    needs_work: 'bg-red-600/20 text-red-300 border-red-500',
    approved: 'bg-green-600/20 text-green-300 border-green-500',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate('/student/entries')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Entries
        </button>

        {/* Entry Content */}
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
          {editing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="w-full text-2xl font-bold px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
              <textarea
                value={editData.body}
                onChange={(e) => setEditData({ ...editData, body: e.target.value })}
                rows="8"
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  <Save size={18} />
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2 rounded-xl transition-colors"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{entry.title}</h1>
                  <p className="text-slate-500 text-sm mt-2">{new Date(entry.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColors[entry.status]}`}>
                    {entry.status}
                  </span>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-slate-700 whitespace-pre-wrap">{entry.body}</p>
              </div>

              {entry.tags?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map(tag => (
                      <span key={tag} className="bg-purple-50 text-purple-700 border border-purple-200 text-sm px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {entry.resources?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Resources</h3>
                  <div className="space-y-2">
                    {entry.resources.map(resource => (
                      <a
                        key={resource}
                        href={resource}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm block transition-colors"
                      >
                        {resource}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Mentor Feedback</h2>

          {/* Comments List */}
          <div className="space-y-4 mb-6">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-slate-900">{comment.mentorName}</p>
                    <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-700">{comment.message}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-4">No feedback yet. Check back soon!</p>
            )}
          </div>

          {/* Add Comment (for mentors only - read-only for students) */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">Your mentor will provide feedback here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
