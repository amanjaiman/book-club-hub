import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, UserGroupIcon, ArrowRightOnRectangleIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface CreateBookClubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function CreateBookClubModal({ isOpen, onClose }: CreateBookClubModalProps) {
  const [name, setName] = useState('');
  const { createBookClub } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBookClub(name);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{ margin: 0 }} className="fixed inset-0 h-[100vh] overflow-hidden bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl shadow-surface-500/5 p-6 border border-white/30 w-96"
      >
        <h2 className="text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
          Create New Book Club
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Book Club Name"
            className="w-full px-4 py-2 rounded-lg bg-white/50 border border-surface-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-surface-600 hover:text-surface-900 rounded-lg hover:bg-surface-100/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

interface JoinBookClubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function JoinBookClubModal({ isOpen, onClose }: JoinBookClubModalProps) {
  const [inviteCode, setInviteCode] = useState('');
  const { joinBookClub } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await joinBookClub(inviteCode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{ margin: 0 }} className="fixed inset-0 h-[100vh] overflow-hidden bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl shadow-surface-500/5 p-6 border border-white/30 w-96"
      >
        <h2 className="text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
          Join Book Club
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Invite Code"
            className="w-full px-4 py-2 rounded-lg bg-white/50 border border-surface-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-surface-600 hover:text-surface-900 rounded-lg hover:bg-surface-100/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Join
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function BookClubList() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { user, logout } = useAuth();

  // Get all book clubs the user is a member of from localStorage
  const getUserBookClubs = () => {
    const allBookClubs = Object.entries(localStorage)
      .filter(([key]) => key.startsWith('bookclub_'))
      .map(([, value]) => JSON.parse(value))
      .filter((club) => club.members.includes(user?.id));
    return allBookClubs;
  };

  const bookClubs = getUserBookClubs();

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3">
        <BookOpenIcon className="w-7 h-7 text-primary-500" />
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
          My Book Clubs
        </h1>
        <div className="flex items-center gap-3">
            <span className="text-surface-600">
              Logged in as <span className="font-medium text-surface-900">{user?.name}</span>
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-surface-600 hover:text-surface-900 rounded-lg hover:bg-surface-100/50 transition-colors"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
      </div>

      <div className="glass-card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookClubs.map((club, index) => (
            <motion.div
              key={club.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card cursor-pointer hover:ring-2 hover:ring-primary-100 transition-all"
              onClick={() => {
                localStorage.setItem('current_bookclub', JSON.stringify(club));
                window.location.reload();
              }}
            >
              <h3 className="text-xl font-semibold text-surface-900 mb-2">{club.name}</h3>
              <p className="text-surface-600">{club.members.length} members</p>
            </motion.div>
          ))}
        </div>

        {bookClubs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <p className="text-xl font-medium text-surface-900 mb-2">Welcome to Book Club!</p>
            <p className="text-surface-600 mb-6">You haven't joined any book clubs yet.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Create Your First Club
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-white border border-primary-600 rounded-lg hover:bg-primary-600 transition-colors"
              >
                <UserGroupIcon className="w-5 h-5" />
                Join Existing Club
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <CreateBookClubModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <JoinBookClubModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </div>
  );
} 