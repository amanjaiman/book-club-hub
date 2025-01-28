import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpenIcon, SparklesIcon, 
  ChartBarIcon, HomeIcon,
  ArrowRightOnRectangleIcon, ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { AuthProvider } from './contexts/AuthContext'
import { BookClubProvider } from './contexts/BookClubContext'
import Auth from './components/Auth'
import BookManager from './components/BookManager'
import Dashboard from './components/Dashboard'
import BookDiscussion from './components/BookDiscussion'
import BookClubList from './components/BookClubList'
import ClubStats from './components/ClubStats'
import BookSetup from './components/BookSetup'
import { useAuth } from './contexts/AuthContext'

interface SidebarLinkProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  isActive: boolean
  onClick: () => void
}

function SidebarLink({ icon: Icon, label, isActive, onClick }: SidebarLinkProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isActive 
          ? 'bg-primary-100 text-primary-900' 
          : 'hover:bg-surface-100 text-surface-600'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  )
}

function AppContent() {
  const { user, bookClub, isLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarOpen] = useState(true)
  const [copied, setCopied] = useState(false)

  const handleCopyInviteCode = async () => {
    if (bookClub?.inviteCode) {
      await navigator.clipboard.writeText(bookClub.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-surface-600">Loading...</div>
      </div>
    )
  }

  // Show auth screen if not logged in
  if (!user) {
    return <Auth />
  }

  // Show book club list if no book club is selected
  if (!bookClub) {
    return <BookClubList />
  }

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'books', label: 'Book List', icon: BookOpenIcon },
    { id: 'stats', label: 'Club Stats', icon: ChartBarIcon },
  ]

  return (
    <BookClubProvider>
      <div className="min-h-screen bg-surface-50 flex">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: isSidebarOpen ? 280 : 80 }}
          className="sticky top-0 h-screen bg-white border-r border-surface-200 p-4 flex flex-col"
        >
          <div className="flex items-center gap-3 mb-8">
            <span className="relative">
              <BookOpenIcon className="w-10 h-10 text-primary-500" />
              <SparklesIcon className="w-4 h-4 text-accent-500 absolute -top-1 -right-1 animate-pulse-slow" />
            </span>
            {isSidebarOpen && (
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600"
              >
                Book Club Hub
              </motion.h1>
            )}
          </div>

          <nav className="flex-1 space-y-2">
            {navigation.map((item) => (
              <SidebarLink
                key={item.id}
                icon={item.icon}
                label={isSidebarOpen ? item.label : ''}
                isActive={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </nav>

          <div className="space-y-4 pt-4 border-t border-surface-200">
            {isSidebarOpen && bookClub?.inviteCode && (
              <div className="px-4 py-2">
                <div className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 mb-2">
                  Club Invite Code
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-mono text-sm bg-surface-50 px-3 py-2 rounded-lg text-surface-900 select-all border border-surface-200/50 flex-1">
                    {bookClub.inviteCode}
                  </div>
                  <button
                    onClick={handleCopyInviteCode}
                    className="text-surface-500 hover:text-surface-700 transition-colors p-2"
                    title="Copy invite code"
                  >
                    {copied ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      <ClipboardDocumentIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-3 text-surface-600 hover:text-surface-900 rounded-lg hover:bg-surface-100 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              {isSidebarOpen && (
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-medium">Logout</span>
                  <span className="text-sm text-surface-500 ml-auto">({user.name})</span>
                </div>
              )}
            </button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto"
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'books' && <BookManager />}
              {activeTab === 'setup' && <BookSetup />}
              {activeTab === 'discussion' && <BookDiscussion />}
              {activeTab === 'stats' && <ClubStats />}
              {/* Add other components for new tabs */}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </BookClubProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
