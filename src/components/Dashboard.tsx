import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useBookClub } from '../contexts/BookClubContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ClockIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  TrashIcon,
  HomeIcon,
  BookOpenIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import BookSelector from './BookSelector';
import BookSetup from './BookSetup';

export default function Dashboard() {
  const { currentBook, addDiscussionTopic, members, clearDiscussionTopics } = useBookClub();
  const { user } = useAuth();
  const [newTopic, setNewTopic] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showAllMeetings, setShowAllMeetings] = useState(false);

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    addDiscussionTopic(newTopic.trim());
    setNewTopic('');
  };

  const nextMeeting = currentBook?.meetings?.filter(m => new Date(`${m.date}T${m.startTime}`) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <HomeIcon className="w-7 h-7 text-primary-500" />
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
          Dashboard
        </h1>
      </div>

      {/* Book Selection Section */}
      <BookSelector />

      {/* Book Setup Section - Only visible to the selector when book is in setup status */}
      {currentBook && currentBook.status === 'setup' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {currentBook.selectedBy === user?.id ? (
            <BookSetup />
          ) : (
            <div className="glass-card">
              <div className="flex items-center gap-3 mb-4">
                <CalendarIcon className="w-6 h-6 text-primary-500" />
                <h2 className="text-xl font-semibold text-surface-900">Book Setup in Progress</h2>
              </div>
              <p className="text-surface-600">
                {members.find(m => m.id === currentBook.selectedBy)?.name || 'The selector'} is currently setting up meeting dates for "{currentBook.title}".
                You'll be notified when the book is ready to start reading!
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Current Book Section - Only visible when book is in reading status */}
      {currentBook && currentBook.status === 'reading' && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
          >
            <h2 className="text-2xl font-bold text-surface-900 mb-4">Currently Reading</h2>
            <div className="flex gap-6">
              <div className="w-32 h-48 bg-surface-100 rounded-lg overflow-hidden">
                {currentBook.coverUrl && (
                  <img 
                    src={currentBook.coverUrl} 
                    alt={currentBook.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-surface-900">{currentBook.title}</h3>
                <p className="text-surface-600">{currentBook.author}</p>
                <div className="mt-4 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-primary-500" />
                  <span className="text-surface-700">
                    Started on {format(new Date(currentBook.startDate), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-sm font-medium text-surface-700 mb-2">Reading Progress</div>
                  <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${(currentBook.currentPage / currentBook.pageCount) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 text-sm text-surface-600">
                    Page {currentBook.currentPage} of {currentBook.pageCount}
                  </div>
                </div>
              </div>
            </div>

            {nextMeeting && (
              <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-5 h-5 text-primary-500" />
                  <h4 className="font-medium text-primary-900">Next Meeting</h4>
                </div>
                <p className="text-lg font-medium text-primary-700">
                  {format(new Date(nextMeeting.date), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-primary-600">
                  {nextMeeting.startTime} - {nextMeeting.endTime}
                  {nextMeeting.location && ` • ${nextMeeting.location}`}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <BookOpenIcon className="w-4 h-4 text-primary-500" />
                  <p className="text-primary-600">
                    Read to page {nextMeeting.targetPage}
                    <span className="text-primary-400"> of {currentBook.pageCount}</span>
                  </p>
                </div>
                {nextMeeting.notes && (
                  <p className="mt-2 text-sm text-primary-600">{nextMeeting.notes}</p>
                )}
              </div>
            )}

            {currentBook.meetings && currentBook.meetings.length > 0 && (
              <div className="mt-6">
                <button 
                  onClick={() => setShowAllMeetings(!showAllMeetings)}
                  className="w-full flex items-center justify-between text-sm font-medium text-surface-700 mb-2 hover:text-surface-900 transition-colors"
                >
                  <span>All Meetings</span>
                  <ChevronDownIcon 
                    className={`w-5 h-5 transition-transform duration-200 ${
                      showAllMeetings ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: showAllMeetings ? 'auto' : 0,
                    opacity: showAllMeetings ? 1 : 0
                  }}
                  transition={{
                    duration: 0.2,
                    ease: 'easeInOut'
                  }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2">
                    {currentBook.meetings.map((meeting, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          meeting === nextMeeting
                            ? 'bg-primary-50 border-primary-100'
                            : 'bg-white/50 border-surface-200/50'
                        }`}
                      >
                        <p className="font-medium text-surface-900">
                          {format(new Date(meeting.date), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-surface-600">
                          {meeting.startTime} - {meeting.endTime}
                          {meeting.location && ` • ${meeting.location}`}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <BookOpenIcon className="w-4 h-4 text-surface-500" />
                          <p className="text-sm text-surface-600">
                            Read to page {meeting.targetPage}
                            <span className="text-surface-400"> of {currentBook.pageCount}</span>
                          </p>
                        </div>
                        {meeting.notes && (
                          <p className="mt-1.5 text-sm text-surface-500">{meeting.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* Discussion Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ChatBubbleLeftIcon className="w-6 h-6 text-primary-500" />
                <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
                  Discussion Topics
                </h3>
              </div>
              {user?.id === currentBook?.selectedBy && (
                <>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="btn-surface flex items-center gap-2 text-red-600 hover:text-red-700 text-sm p-3"
                  >
                    <TrashIcon className="w-5 h-5" />
                    Clear All Topics
                  </button>
                  {showClearConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                        <h4 className="text-lg font-semibold mb-2">Clear All Topics?</h4>
                        <p className="text-surface-600 mb-4">
                          Are you sure you want to clear all discussion topics? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setShowClearConfirm(false)}
                            className="btn-surface"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              clearDiscussionTopics();
                              setShowClearConfirm(false);
                            }}
                            className="btn-primary bg-red-600 hover:bg-red-700"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <form onSubmit={handleAddTopic} className="flex gap-3 mb-6">
              <input
                type="text"
                className="input flex-1"
                placeholder="Add a discussion topic..."
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Add Topic
              </button>
            </form>

            {currentBook.discussionTopics && currentBook.discussionTopics.length > 0 ? (
              <div className="space-y-4">
                {currentBook.discussionTopics.map((topic) => (
                  <div key={topic.id} className="p-4 bg-surface-50 rounded-xl">
                    <p className="text-surface-900">{topic.text}</p>
                    <p className="mt-2 text-sm text-surface-500">
                      Added on {format(new Date(topic.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-600 text-center py-8">
                No discussion topics yet. Add one to get started!
              </p>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
} 