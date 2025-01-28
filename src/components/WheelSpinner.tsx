import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBookClub } from '../contexts/BookClubContext';

export default function WheelSpinner() {
  const { members, spinWheel, nextSelector } = useBookClub();
  const [isSpinning, setIsSpinning] = useState(false);

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
                  className="absolute top-[10%] left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg border border-white/20"
                  style={{
                    transform: `rotate(-${angle}deg)`,
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

      <button
        onClick={handleSpin}
        disabled={isSpinning || nextSelector !== null}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSpinning ? 'Spinning...' : nextSelector ? 'Member Selected' : 'Spin the Wheel'}
      </button>
    </div>
  );
} 