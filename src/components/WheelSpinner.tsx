import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBookClub } from '../contexts/BookClubContext';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function WheelSpinner() {
  const { members, spinWheel, nextSelector, selectNextReader } = useBookClub();
  const { user, bookClub } = useAuth();
  const [isSpinning, setIsSpinning] = useState(false);
  const [showMemberSelect, setShowMemberSelect] = useState(false);

  useEffect(() => {
    if (nextSelector) {
      setIsSpinning(false);
    }
  }, [nextSelector]);

  const handleSpin = () => {
    setIsSpinning(true);
    // Wait for animation to start before actually selecting
    setTimeout(() => {
      spinWheel();
    }, 3000);
  };

  const handleManualSelect = (memberId: string) => {
    selectNextReader(memberId);
    setShowMemberSelect(false);
  };

  const isOwner = user?.id === bookClub?.ownerId;

  if (members.length === 0) {
    return (
      <div className="glass-card">
        <p className="text-surface-600 text-center">
          No members available. Invite some members to your book club!
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div className="relative aspect-square max-w-md mx-auto mb-6">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-full blur-2xl animate-pulse-slow" />
        
        {/* Spinning wheel */}
        <motion.div
          className="relative w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 shadow-xl flex items-center justify-center
            before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/20 before:to-transparent before:blur-sm"
          animate={{ rotate: isSpinning ? 360 * 5 : 0 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        >
          {/* Inner circle with name */}
          <div className="absolute inset-3 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center p-8 shadow-inner">
            {nextSelector ? (
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-2xl font-semibold text-surface-900 text-center"
              >
                {nextSelector.name}
              </motion.p>
            ) : (
              <p className="text-surface-500 font-medium text-center">
                {isSpinning ? "Spinning..." : "Spin to select"}
              </p>
            )}
          </div>

          {/* Dividing lines and names */}
          {members.map((member, index) => {
            const angle = (360 / members.length) * index;
            return (
              <div
                key={member.id}
                className="absolute inset-0"
                style={{
                  transform: `rotate(${angle}deg)`,
                }}
              >
                {/* Line */}
                <div className="absolute top-0 left-1/2 h-1/2 w-0.5 bg-white/20 origin-bottom" />
                {/* Name */}
                <div 
                  className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg border border-white/20"
                  style={{
                    transform: `translateY(-50%) rotate(-${angle}deg)`,
                  }}
                >
                  <p className="text-surface-900 text-sm font-medium whitespace-nowrap">
                    {member.name}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleSpin}
          disabled={isSpinning || nextSelector !== null}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSpinning ? 'Spinning...' : nextSelector ? 'Member Selected' : 'Spin the Wheel'}
        </button>

        {isOwner && !nextSelector && !isSpinning && (
          <div className="relative">
            <button
              onClick={() => setShowMemberSelect(!showMemberSelect)}
              className="w-full px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-900 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>Manually Select Reader</span>
              <ChevronDownIcon className={`w-5 h-5 transition-transform ${showMemberSelect ? 'rotate-180' : ''}`} />
            </button>

            {showMemberSelect && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-surface-200 py-1 max-h-48 overflow-y-auto">
                {members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleManualSelect(member.id)}
                    className="w-full px-4 py-2 text-left hover:bg-surface-100 transition-colors"
                  >
                    {member.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 