import { useState } from 'react';
import { HomeIcon, BookOpenIcon, ChartBarIcon, ChevronUpIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileNav() {
  const location = useLocation();
  const { user, bookClub, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const navItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/' },
    { name: 'Book List', icon: BookOpenIcon, path: '/books' },
    { name: 'Club Stats', icon: ChartBarIcon, path: '/stats' },
  ];

  const handleCopyInviteCode = async () => {
    if (bookClub?.inviteCode) {
      await navigator.clipboard.writeText(bookClub.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Floating Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowMenu(false)}
            />
            
            {/* Menu Content */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-20 left-4 right-4 bg-white rounded-xl shadow-xl p-4 z-50 md:hidden"
            >
              {bookClub?.inviteCode && (
                <button
                  onClick={handleCopyInviteCode}
                  className="w-full flex items-center justify-between px-4 py-3 text-surface-600 hover:text-surface-900 rounded-lg hover:bg-surface-100 transition-colors"
                >
                  <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">Club Invite Code</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-surface-500">{bookClub.inviteCode}</span>
                    {copied ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      <ClipboardDocumentIcon className="w-5 h-5" />
                    )}
                  </div>
                </button>
              )}
              
              <button
                onClick={logout}
                className="w-full flex items-center justify-between px-4 py-3 text-surface-600 hover:text-surface-900 rounded-lg hover:bg-surface-100 transition-colors"
              >
                <span className="font-medium">Logout</span>
                <span className="text-sm text-surface-500">({user?.name})</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 md:hidden">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center w-16 py-1 ${
                  isActive ? 'text-primary-600' : 'text-surface-600'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex flex-col items-center justify-center w-16 py-1 text-surface-600"
          >
            <ChevronUpIcon 
              className={`w-6 h-6 transition-transform duration-200 ${
                showMenu ? 'rotate-180' : ''
              }`}
            />
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </nav>
    </>
  );
} 