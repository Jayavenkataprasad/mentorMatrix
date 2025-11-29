import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/client';
import { User, Mail, Lock, AlertCircle, Eye, EyeOff, BookOpen, Users, Key } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [secretCode, setSecretCode] = useState('');
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const registrationData = { name, email, password, role };
      if (role === 'mentor') {
        registrationData.secretCode = secretCode;
      }
      
      const response = await authAPI.register(registrationData);
      // Don't auto-login after registration, redirect to login instead
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please login with your credentials.',
          type: 'success'
        }
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-8 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Join Mentor Matrix</h1>
          <p className="text-purple-200">Start your learning journey today</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Create a strong password"
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-purple-400 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">I want to join as</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={role === 'student'}
                  onChange={(e) => setRole(e.target.value)}
                  className="sr-only peer"
                />
                <div className={`p-4 rounded-xl border-2 transition-all ${
                  role === 'student' 
                    ? 'border-purple-500 bg-purple-600/20' 
                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                }`}>
                  <BookOpen className={`mx-auto mb-2 ${role === 'student' ? 'text-purple-400' : 'text-gray-400'}`} size={24} />
                  <p className={`text-center font-medium ${role === 'student' ? 'text-purple-300' : 'text-gray-300'}`}>
                    Student
                  </p>
                  <p className="text-xs text-center text-gray-400 mt-1">Learn and grow</p>
                </div>
              </label>

              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="mentor"
                  checked={role === 'mentor'}
                  onChange={(e) => setRole(e.target.value)}
                  className="sr-only peer"
                />
                <div className={`p-4 rounded-xl border-2 transition-all ${
                  role === 'mentor' 
                    ? 'border-purple-500 bg-purple-600/20' 
                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                }`}>
                  <Users className={`mx-auto mb-2 ${role === 'mentor' ? 'text-purple-400' : 'text-gray-400'}`} size={24} />
                  <p className={`text-center font-medium ${role === 'mentor' ? 'text-purple-300' : 'text-gray-300'}`}>
                    Mentor
                  </p>
                  <p className="text-xs text-center text-gray-400 mt-1">Guide and teach</p>
                </div>
              </label>
            </div>
          </div>

          {role === 'mentor' && (
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Secret Code</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type={showSecretCode ? 'text' : 'password'}
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Enter mentor secret code"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSecretCode(!showSecretCode)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-purple-400 transition-colors"
                >
                  {showSecretCode ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Secret code is required for mentor registration</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <div className="text-center text-xs text-gray-500">
            <p className="mb-2">Choose your role to get started:</p>
            <div className="space-y-1">
              <p><span className="text-purple-400">Student:</span> Access courses, submit assignments, track progress</p>
              <p><span className="text-purple-400">Mentor:</span> Create content, review submissions, guide students (requires secret code)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
