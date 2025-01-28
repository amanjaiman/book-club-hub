import { useBookClub } from '../contexts/BookClubContext';
import { useAuth } from '../contexts/AuthContext';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function BookVoting() {
  const { currentBook, voteOnBook, members } = useBookClub();
  const { user } = useAuth();

  if (!currentBook || currentBook.status !== 'proposed') return null;

  const hasVoted = user ? currentBook.votes[user.id] : false;
  const votes = Object.values(currentBook.votes);
  const approvals = votes.filter(v => v === 'approve').length;
  const vetoes = votes.filter(v => v === 'veto').length;
  const votingMembers = members.filter(m => m.id !== currentBook.selectedBy);
  const remaining = votingMembers.length - votes.length;

  // If this is the user who proposed the book
  if (currentBook.selectedBy === user?.id) {
    return (
      <div className="glass-card">
        <h2 className="text-2xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
          Waiting for Votes
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-surface-600">Approvals</span>
            <span className="font-medium text-primary-600">{approvals}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-surface-600">Vetoes</span>
            <span className="font-medium text-red-600">{vetoes}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-surface-600">Waiting for</span>
            <span className="font-medium text-surface-600">{remaining}</span>
          </div>
        </div>
      </div>
    );
  }

  // If the user has already voted
  if (hasVoted) {
    return (
      <div className="glass-card">
        <h2 className="text-2xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
          You've Voted
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-surface-600">You voted to</span>
          {currentBook.votes[user!.id] === 'approve' ? (
            <span className="text-primary-600 font-medium">approve</span>
          ) : (
            <span className="text-red-600 font-medium">veto</span>
          )}
          <span className="text-surface-600">this book.</span>
        </div>
        <div className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-surface-600">Approvals</span>
            <span className="font-medium text-primary-600">{approvals}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-surface-600">Vetoes</span>
            <span className="font-medium text-red-600">{vetoes}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-surface-600">Waiting for</span>
            <span className="font-medium text-surface-600">{remaining}</span>
          </div>
        </div>
      </div>
    );
  }

  // If the user hasn't voted yet
  return (
    <div className="glass-card">
      <h2 className="mb-4 text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
        {currentBook.title}
      </h2>
      <div className="mb-6">
        <div className="flex gap-6">
          {currentBook.coverUrl && (
            <img 
              src={currentBook.coverUrl} 
              alt={currentBook.title}
              className="w-32 h-auto rounded-lg shadow-lg"
            />
          )}
          <div className="flex-1">
            <h3 className="text-xl font-medium text-surface-900">by {currentBook.author}</h3>
            {currentBook.category && (
              <span className="inline-block mt-2 px-3 py-1 bg-surface-100 text-surface-600 rounded-full text-sm">
                {currentBook.category}
              </span>
            )}
            <h4 className="text-surface-600 mt-2">Pages: {currentBook.pageCount}</h4>
            <p className="text-surface-600 mt-2">Proposed by {members.find(m => m.id === currentBook.selectedBy)?.name}</p>
          </div>
        </div>
        {currentBook.description && (
          <div className="mt-4">
            <p className="text-surface-700 text-sm line-clamp-4 hover:line-clamp-none transition-all duration-200">
              {currentBook.description}
            </p>
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => voteOnBook('approve')}
          className="flex-1 btn-primary flex items-center justify-center gap-2"
        >
          <CheckIcon className="w-5 h-5" />
          <span>Approve</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => voteOnBook('veto')}
          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-2xl font-medium shadow-sm hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <XMarkIcon className="w-5 h-5" />
          <span>Veto</span>
        </motion.button>
      </div>
    </div>
  );
} 