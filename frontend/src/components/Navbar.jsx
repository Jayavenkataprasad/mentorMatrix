import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, AlertTriangle, BookOpen, Users, CheckSquare, MessageCircle, Home, Settings } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
    { label: 'Dashboard', path: '/student/dashboard', icon: Home },
    { label: 'My Entries', path: '/student/entries', icon: BookOpen },
    { label: 'My Tasks', path: '/student/tasks', icon: CheckSquare },
    { label: 'Doubts', path: '/student/doubts', icon: MessageCircle },
  ];

  const mentorLinks = [
    { label: 'Dashboard', path: '/mentor/dashboard', icon: Home },
    { label: 'Students', path: '/mentor/students', icon: Users },
    { label: 'Assign Task', path: '/mentor/tasks/assign', icon: CheckSquare },
    { label: 'Task Management', path: '/mentor/tasks', icon: Settings },
  ];

  const links = user?.role === 'student' ? studentLinks : mentorLinks;

  const isActiveLink = (path) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold">Mentor Portal</h1>
            <div className="hidden md:flex gap-2">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = isActiveLink(link.path);
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-white/20 shadow-lg backdrop-blur-sm border border-white/30' 
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <span className="text-sm font-medium">{user?.name}</span>
                <div className="text-xs opacity-75 capitalize">{user?.role}</div>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                <span className="text-sm font-bold">{user?.name?.charAt(0)?.toUpperCase()}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
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
          <div className="md:hidden pb-4 border-t border-white/20 mt-4 pt-4 space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = isActiveLink(link.path);
              return (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-white/20 shadow-lg backdrop-blur-sm border border-white/30' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                </button>
              );
            })}
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
