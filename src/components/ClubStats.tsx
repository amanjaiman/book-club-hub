import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBookClub } from '../contexts/BookClubContext';
import { 
  BookOpenIcon, 
  StarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function ClubStats() {
  const { currentBook, bookHistory, members } = useBookClub();

  const stats = useMemo(() => {
    if (!members || members.length === 0) return null;
    
    const allBooks = [...(currentBook ? [currentBook] : []), ...bookHistory];
    
    const totalBooks = allBooks.length;
    const completedBooks = allBooks.filter(book => book.status === 'completed');
    const averageRating = allBooks.reduce((acc, book) => {
      const ratings = Object.values(book.ratings || {});
      if (ratings.length === 0) return acc;
      return acc + (ratings.reduce((sum, r) => sum + r, 0) / ratings.length);
    }, 0) / (totalBooks || 1);

    // Calculate reading pace and engagement stats
    const totalPages = allBooks.reduce((acc, book) => acc + (book.pageCount || 0), 0);
    const completedPages = completedBooks.reduce((acc, book) => acc + (book.pageCount || 0), 0);
    const averageBookLength = Math.round(totalPages / totalBooks);
    
    // Calculate time stats
    const firstBook = [...allBooks].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
    const daysSinceStart = firstBook ? Math.round((new Date().getTime() - new Date(firstBook.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const booksPerMonth = daysSinceStart ? (totalBooks * 30 / daysSinceStart).toFixed(1) : 0;
    const pagesPerMonth = daysSinceStart ? Math.round(completedPages * 30 / daysSinceStart) : 0;

    // Calculate discussion engagement
    const totalDiscussions = allBooks.reduce((acc, book) => acc + ((book.discussions || []).length || 0), 0);
    const averageDiscussionsPerBook = totalDiscussions / totalBooks;
    
    // Calculate highest rated book
    const highestRatedBook = [...allBooks]
      .map(book => {
        const ratings = Object.values(book.ratings || {});
        const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        return { ...book, averageRating: avgRating };
      })
      .sort((a, b) => b.averageRating - a.averageRating)[0];

    const memberStats = members.map(member => {
      // Books selected by this member
      const selectedBooks = allBooks.filter(b => b.selectedBy === member.id);
      const averageBookRating = selectedBooks.length > 0
        ? selectedBooks.reduce((acc, book) => {
            const ratings = Object.values(book.ratings || {});
            if (ratings.length === 0) return acc;
            return acc + (ratings.reduce((sum, r) => sum + r, 0) / ratings.length);
          }, 0) / selectedBooks.length
        : 0;

      // Average rating given by this member
      const ratedBooks = allBooks.filter(book => book.ratings && book.ratings[member.id]);
      const averageGivenRating = ratedBooks.length > 0
        ? ratedBooks.reduce((acc, book) => acc + (book.ratings[member.id] || 0), 0) / ratedBooks.length
        : 0;

      return {
        ...member,
        booksSelected: selectedBooks.length,
        averageBookRating: Number(averageBookRating.toFixed(1)),
        averageGivenRating: Number(averageGivenRating.toFixed(1)),
      };
    });

    return {
      totalBooks,
      averageRating,
      memberStats,
      totalPages,
      completedPages,
      averageBookLength,
      booksPerMonth,
      pagesPerMonth,
      totalDiscussions,
      averageDiscussionsPerBook: Number(averageDiscussionsPerBook.toFixed(1)),
      daysSinceStart,
      highestRatedBook: highestRatedBook ? {
        title: highestRatedBook.title,
        rating: Number(highestRatedBook.averageRating.toFixed(1))
      } : null
    };
  }, [currentBook, bookHistory, members]);

  if (!stats || !stats.memberStats) {
    return (
      <div className="glass-card">
        <p className="text-surface-500 text-center py-8">No stats available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <ChartBarIcon className="w-7 h-7 text-primary-500" />
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
          Club Statistics
        </h1>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpenIcon className="w-5 h-5 text-primary-500" />
            <h3 className="font-medium text-surface-900">Reading Progress</h3>
          </div>
          <p className="text-2xl font-bold text-surface-900">{stats.totalBooks} books</p>
          <p className="text-sm text-surface-600">{stats.completedPages.toLocaleString()} pages read</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <StarIcon className="w-5 h-5 text-primary-500" />
            <h3 className="font-medium text-surface-900">Club Rating</h3>
          </div>
          <p className="text-2xl font-bold text-surface-900">{stats.averageRating.toFixed(1)}</p>
          {stats.highestRatedBook && (
            <p className="text-sm text-surface-600">
              Best: {stats.highestRatedBook.title} ({stats.highestRatedBook.rating})
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-medium text-surface-900">Reading Pace</h3>
          </div>
          <p className="text-2xl font-bold text-surface-900">{stats.booksPerMonth} books/month</p>
          <p className="text-sm text-surface-600">{stats.pagesPerMonth.toLocaleString()} pages/month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="font-medium text-surface-900">Engagement</h3>
          </div>
          <p className="text-2xl font-bold text-surface-900">{stats.totalDiscussions}</p>
          <p className="text-sm text-surface-600">{stats.averageDiscussionsPerBook} discussions/book</p>
        </motion.div>

        {/* Member Stats Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card col-span-full"
        >
          <h3 className="font-medium text-surface-900 mb-4">Member Statistics</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-surface-600">
                  <th className="pb-2">Member</th>
                  <th className="pb-2">Books Selected</th>
                  <th className="pb-2">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4" />
                      <span>Books Rating</span>
                      <span className="text-xs text-surface-400">(picked)</span>
                    </div>
                  </th>
                  <th className="pb-2">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4" />
                      <span>Average Rating</span>
                      <span className="text-xs text-surface-400">(given)</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.memberStats.map((member) => (
                  <tr key={member.id} className="border-t border-surface-200/50">
                    <td className="py-3">{member.name}</td>
                    <td className="py-3">{member.booksSelected}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-accent-400" />
                        <span>{member.averageBookRating || '-'}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-accent-400" />
                        <span>{member.averageGivenRating || '-'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 