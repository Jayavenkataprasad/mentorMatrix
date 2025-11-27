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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">Loading...</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-gray-600">Entry not found</p>
        </div>
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    needs_work: 'bg-red-100 text-red-800',
    approved: 'bg-green-100 text-green-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/student/entries')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Entries
        </button>

        {/* Entry Content */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {editing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="w-full text-2xl font-bold px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <textarea
                value={editData.body}
                onChange={(e) => setEditData({ ...editData, body: e.target.value })}
                rows="8"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  <Save size={18} />
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
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
                  <h1 className="text-3xl font-bold text-gray-800">{entry.title}</h1>
                  <p className="text-gray-500 text-sm mt-2">{new Date(entry.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColors[entry.status]}`}>
                    {entry.status}
                  </span>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-wrap">{entry.body}</p>
              </div>

              {entry.tags?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map(tag => (
                      <span key={tag} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {entry.resources?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Resources</h3>
                  <div className="space-y-2">
                    {entry.resources.map(resource => (
                      <a
                        key={resource}
                        href={resource}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm block"
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Mentor Feedback</h2>

          {/* Comments List */}
          <div className="space-y-4 mb-6">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-800">{comment.mentorName}</p>
                    <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700">{comment.message}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No feedback yet. Check back soon!</p>
            )}
          </div>

          {/* Add Comment (for mentors only - read-only for students) */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">Your mentor will provide feedback here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
