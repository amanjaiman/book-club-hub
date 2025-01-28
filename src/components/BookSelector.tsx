import { useBookClub } from '../contexts/BookClubContext';
import { useAuth } from '../contexts/AuthContext';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import WheelSpinner from './WheelSpinner';
import BookProposal from './BookProposal';
import BookVoting from './BookVoting';

export default function BookSelector() {
  const { currentBook, nextSelector, members } = useBookClub();
  const { user } = useAuth();

  // Don't show anything if there's a current book that's being read
  if (currentBook?.status === 'reading' || currentBook?.status === 'setup') {
    return null;
  }

  // Calculate if all votes are in
  const votingMembers = currentBook ? members.filter(m => m.id !== currentBook.selectedBy) : [];
  const totalVotes = currentBook ? Object.keys(currentBook.votes).length : 0;
  const allVotesIn = totalVotes === votingMembers.length;

  // Determine what state we're in
  const isVotingPhase = currentBook?.status === 'proposed' && !allVotesIn;
  const isSelectionPhase = !isVotingPhase && nextSelector;
  const isSpinPhase = !isVotingPhase && !nextSelector;

  return (
    <div className="glass-card">
      <h2 className="text-2xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
        {isVotingPhase ? 'Book Voting' : 'Select Next Reader'}
      </h2>

      <AnimatePresence mode="wait">
        {isVotingPhase && (
          <motion.div
            key="voting"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <BookVoting />
          </motion.div>
        )}

        {isSpinPhase && (
          <motion.div
            key="wheel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <WheelSpinner />
          </motion.div>
        )}

        {isSelectionPhase && nextSelector && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <BookmarkIcon className="w-6 h-6 text-primary-500" />
              <h3 className="text-xl font-semibold text-surface-900">
                {nextSelector.id === user?.id 
                  ? "It's Your Turn to Pick a Book!" 
                  : `Waiting for ${nextSelector.name} to Pick a Book`}
              </h3>
            </div>
            
            {nextSelector.id === user?.id && (
              <BookProposal />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 