import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPortal } from 'react-dom';
import { LogOut, Menu, X, AlertTriangle, BookOpen, Users, CheckSquare, MessageCircle, Home, Settings, HelpCircle } from 'lucide-react';

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
    { label: 'Entries', path: '/mentor/entries', icon: BookOpen },
    { label: 'MCQ Questions', path: '/mentor/mcq', icon: HelpCircle },
    { label: 'Assign Task', path: '/mentor/tasks/assign', icon: CheckSquare },
  ];

  const links = user?.role === 'student' ? studentLinks : mentorLinks;

  const isActiveLink = (path) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-purple-900 via-indigo-900 to-pink-900 text-white shadow-lg transition-all duration-300 backdrop-blur-sm border-b border-purple-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center gap-8">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight drop-shadow-sm text-white">Mentor Matrix</h1>
              <div className="hidden lg:flex gap-2">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = isActiveLink(link.path);
                  return (
                    <button
                      key={link.path}
                      onClick={() => navigate(link.path)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 transform ${
                        isActive 
                          ? 'bg-white/20 shadow-lg backdrop-blur-sm border border-white/30 scale-[1.02]' 
                          : 'hover:bg-white/10 hover:scale-[1.02] hover:shadow-md'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="hidden xl:inline">{link.label}</span>
                      <span className="xl:hidden">{link.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop User Info and Actions */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-sm font-medium hidden lg:block">{user?.name}</span>
                  <span className="text-sm font-medium lg:hidden">{user?.name?.split(' ')[0]}</span>
                  <div className="text-xs opacity-75 capitalize">{user?.role}</div>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30 shadow-sm">
                  <span className="text-sm font-bold">{user?.name?.charAt(0)?.toUpperCase()}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <LogOut size={16} />
                <span className="hidden lg:inline">Log out</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200"
              >
                <LogOut size={18} />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-purple-700/50">
              <div className="flex flex-col gap-2">
                {/* Mobile User Info */}
                <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30 shadow-sm">
                    <span className="text-sm font-bold">{user?.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium block">{user?.name}</span>
                    <div className="text-xs opacity-75 capitalize">{user?.role}</div>
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <div className="flex flex-col gap-1 mt-3">
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
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
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
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal - Rendered via React Portal */}
      {showLogoutConfirm && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-gradient-to-br from-purple-800/90 to-indigo-800/90 backdrop-blur-xl border border-purple-600/50 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-yellow-400" size={24} />
              <h3 className="text-lg font-semibold text-white">Confirm Logout</h3>
            </div>
            <p className="text-purple-200 mb-6">Are you sure you want to logout? You'll need to login again to access your account.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-purple-700/50 hover:bg-purple-600/50 text-white rounded-lg transition-colors border border-purple-600/50"
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
        </div>,
        document.body
      )}
    </>
  );
}
