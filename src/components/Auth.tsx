import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpenIcon, UserIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function Auth() {
  const { user, bookClub, login, logout, createBookClub, joinBookClub } = useAuth();
  const [email, setEmail] = useState('');
  const [bookClubName, setBookClubName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [view, setView] = useState<'login' | 'create' | 'join'>('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email);
      setView('create');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleCreateBookClub = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBookClub(bookClubName);
    } catch (error) {
      console.error('Failed to create book club:', error);
    }
  };

  const handleJoinBookClub = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await joinBookClub(inviteCode);
    } catch (error) {
      console.error('Failed to join book club:', error);
    }
  };

  if (user && bookClub) {
    return (
      <div className="glass-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserIcon className="w-6 h-6 text-primary-500" />
          <p className="text-surface-600">
            Logged in as <span className="font-medium text-surface-900">{user.name}</span>
          </p>
        </div>
        <button 
          onClick={logout} 
          className="px-4 py-2 text-surface-600 hover:text-surface-900 rounded-lg hover:bg-surface-100/50 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <BookOpenIcon className="w-16 h-16 text-primary-500" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 mb-2">
            Book Club Hub
          </h1>
          <p className="text-surface-600">Join your book club or create a new one</p>
        </div>

        <div className="glass-card">
          {user && !bookClub ? (
            <>
              <div className="flex gap-4 mb-6">
                <button 
                  onClick={() => setView('create')} 
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    view === 'create' 
                      ? 'bg-primary-600 text-white' 
                      : 'hover:bg-surface-100/50 text-surface-600 hover:text-surface-900'
                  }`}
                >
                  Create Club
                </button>
                <button 
                  onClick={() => setView('join')} 
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    view === 'join' 
                      ? 'bg-primary-600 text-white' 
                      : 'hover:bg-surface-100/50 text-surface-600 hover:text-surface-900'
                  }`}
                >
                  Join Club
                </button>
              </div>

              {view === 'create' ? (
                <form onSubmit={handleCreateBookClub} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Book Club Name"
                    value={bookClubName}
                    onChange={(e) => setBookClubName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/50 border border-surface-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    required
                  />
                  <button 
                    type="submit" 
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Create Book Club
                  </button>
                </form>
              ) : (
                <form onSubmit={handleJoinBookClub} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Invite Code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/50 border border-surface-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    required
                  />
                  <button 
                    type="submit" 
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Join Book Club
                  </button>
                </form>
              )}
            </>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/50 border border-surface-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                required
              />
              <button 
                type="submit" 
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Continue with Email
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
} 