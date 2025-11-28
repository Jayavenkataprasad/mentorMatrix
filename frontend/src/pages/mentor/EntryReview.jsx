import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { entriesAPI, commentsAPI } from '../../api/client';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';

export default function EntryReview() {
  const { entryId } = useParams();
  const [entry, setEntry] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [entryId]);

  const fetchData = async () => {
    try {
      const [entryRes, commentsRes] = await Promise.all([
        entriesAPI.getById(entryId),
        commentsAPI.getAll(entryId)
      ]);
      setEntry(entryRes.data);
      setComments(commentsRes.data);
      setNewStatus(entryRes.data.status);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await commentsAPI.add(entryId, { message: newComment });
      setNewComment('');
      fetchData();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await entriesAPI.updateStatus(entryId, newStatus);
      setEntry({ ...entry, status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <p className="text-purple-200 mt-4">Loading entry...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
            <BookOpen className="mx-auto text-gray-500 mb-4" size={48} />
            <p className="text-gray-400 text-lg">Entry not found</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Entry Content */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">{entry.title}</h1>
              <p className="text-gray-400 text-sm mt-2">
                By: {entry.studentName} | {new Date(entry.createdAt).toLocaleString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColors[entry.status]}`}>
              {entry.status}
            </span>
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-300 whitespace-pre-wrap">{entry.body}</p>
          </div>

          {entry.tags?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-purple-200 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {entry.tags.map(tag => (
                  <span key={tag} className="bg-purple-600/20 text-purple-300 border border-purple-500 text-sm px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entry.resources?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-purple-200 mb-2">Resources</h3>
              <div className="space-y-2">
                {entry.resources.map(resource => (
                  <a
                    key={resource}
                    href={resource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 text-sm block transition-colors"
                  >
                    {resource}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Update */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Update Status</h2>
          <div className="flex gap-3">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="needs_work">Needs Work</option>
              <option value="approved">Approved</option>
            </select>
            <button
              onClick={handleUpdateStatus}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all"
            >
              <CheckCircle size={18} />
              Update
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Feedback</h2>

          {/* Comments List */}
          <div className="space-y-4 mb-6">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-white">{comment.mentorName}</p>
                    <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-300">{comment.message}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No feedback yet</p>
            )}
          </div>

          {/* Add Comment */}
          <div className="border-t border-slate-600 pt-4">
            <label className="block text-sm font-medium text-purple-200 mb-2">Add Feedback</label>
            <div className="flex gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your feedback here..."
                rows="3"
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
              <button
                onClick={handleAddComment}
                disabled={submitting || !newComment.trim()}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl transition-all disabled:opacity-50 h-fit"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
