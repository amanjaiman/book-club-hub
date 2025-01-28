import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useBookClub } from '../contexts/BookClubContext';
import { useAuth } from '../contexts/AuthContext';

export default function BookManager() {
  const { user } = useAuth();
  const { currentBook, bookHistory, rateBook } = useBookClub();
  const allBooks = [...(currentBook ? [currentBook] : []), ...bookHistory];

  const handleRating = (bookId: string, rating: number) => {
    if (!user) return;
    rateBook(bookId, rating);
  };

  const getAverageRating = (ratings: { [userId: string]: number }) => {
    const ratingValues = Object.values(ratings);
    if (ratingValues.length === 0) return 0;
    return Number((ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(1));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <BookOpenIcon className="w-7 h-7 text-primary-500" />
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
          Book List
        </h1>
      </div>

      {/* Book List */}
      <div className="space-y-6">
        {allBooks.length === 0 ? (
          <div className="glass-card">
            <p className="text-surface-500 text-center py-8">
              No books have been read yet. Start by selecting a book!
            </p>
          </div>
        ) : (
          allBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card"
            >
              <div className="flex gap-6">
                {book.coverUrl && (
                  <div className="flex-shrink-0">
                    <img 
                      src={book.coverUrl} 
                      alt={book.title}
                      className="w-24 rounded-lg shadow-lg object-cover"
                      style={{ aspectRatio: '2/3' }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-surface-900 group-hover:text-primary-600 transition-colors duration-200 flex items-center gap-2">
                        <span>{book.title}</span>
                        <span className="text-surface-500 font-normal text-lg">by {book.author}</span>
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {book.category && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 text-indigo-700 border border-indigo-200/50 shadow-sm">
                            {book.category}
                          </span>
                        )}
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-cyan-700 border border-cyan-200/50 shadow-sm">
                          {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-surface-500">Started:</span>
                          <span className="px-2 py-1 font-medium rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-teal-700 border border-teal-200/50 shadow-sm">
                            {format(new Date(book.startDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-surface-500">End Date:</span>
                          <span className="px-2 py-1 font-medium rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-teal-700 border border-teal-200/50 shadow-sm">
                            {format(new Date(book.endDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      {book.description && (
                        <p className="text-surface-700 text-sm line-clamp-2 hover:line-clamp-none transition-all duration-200 mt-2">
                          {book.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {user && (
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => handleRating(book.id, rating)}
                              className="text-accent-400 hover:text-accent-500 transition-colors duration-200"
                            >
                              {rating <= (book.ratings[user.id] || 0) ? (
                                <StarIcon className="w-6 h-6" />
                              ) : (
                                <StarOutlineIcon className="w-6 h-6" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                      {Object.keys(book.ratings).length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-surface-600">
                          <StarIcon className="w-4 h-4 text-accent-400" />
                          <span>{getAverageRating(book.ratings)} ({Object.keys(book.ratings).length})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Meeting Dates */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-surface-700 mb-3">Meetings</h4>
                    <div className="flex flex-wrap gap-2">
                      {book.meetings.map((meeting, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-white/50 backdrop-blur-sm rounded-lg border border-surface-200/50 text-sm font-medium text-surface-900 hover:bg-white/80 transition-colors duration-200 cursor-help"
                          title={`${meeting.startTime} - ${meeting.endTime}${meeting.location ? ` • ${meeting.location}` : ''}${meeting.notes ? `\n${meeting.notes}` : ''}`}
                        >
                          {format(new Date(meeting.date), 'MMM d')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Discussion Topics */}
                  {book.discussionTopics?.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-surface-700 mb-3">Discussion Topics</h4>
                      <div className="space-y-2">
                        {book.discussionTopics.map((topic) => (
                          <div
                            key={topic.id}
                            className="p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-surface-200/50"
                          >
                            <p className="text-surface-900">{topic.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
} 