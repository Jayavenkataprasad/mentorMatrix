import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, AlertTriangle } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const studentLinks = [
    { label: 'Dashboard', path: '/student/dashboard' },
    { label: 'My Entries', path: '/student/entries' },
    { label: 'My Tasks', path: '/student/tasks' },
  ];

  const mentorLinks = [
    { label: 'Dashboard', path: '/mentor/dashboard' },
    { label: 'Students', path: '/mentor/students' },
    { label: 'Assign Task', path: '/mentor/tasks/assign' },
  ];

  const links = user?.role === 'student' ? studentLinks : mentorLinks;

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold">Mentor Portal</h1>
            <div className="hidden md:flex gap-6">
              {links.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md transition-all"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm">{user?.name}</span>
              <span className="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full capitalize">
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {links.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 hover:bg-white hover:bg-opacity-20 rounded-md"
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-yellow-400" size={24} />
              <h3 className="text-lg font-semibold text-white">Confirm Logout</h3>
            </div>
            <p className="text-gray-300 mb-6">Are you sure you want to logout? You'll need to login again to access your account.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
