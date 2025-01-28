import { useState } from 'react';
import { useBookClub } from '../contexts/BookClubContext';
import { useAuth } from '../contexts/AuthContext';
import BookSetup from './BookSetup';

// Function to fetch book data from Google Books API
const fetchBookFromGoogleBooks = async (isbn: string) => {
  try {
    // Remove any hyphens or spaces from ISBN
    const cleanIsbn = isbn.replace(/[-\s]/g, '');
    
    // Construct the Google Books API URL for searching by ISBN
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`;

    // Fetch data from the Google Books API
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.error("No book found with this ISBN.");
      return null;
    }

    // Extract information from the first result
    const book = data.items[0].volumeInfo;
    const bookInfo = {
      title: book.title,
      authors: book.authors || ["Unknown Author"],
      description: book.description || "No description available",
      coverImage: book.imageLinks?.thumbnail,
      pageCount: book.pageCount || 0,
      author: book.authors ? book.authors[0] : "Unknown Author",
      coverUrl: book.imageLinks?.thumbnail || '',
      isbn: book.industryIdentifiers?.[0]?.identifier || cleanIsbn,
      category: book.categories?.[0] || "Unknown Category",
    };

    console.log(bookInfo);

    return bookInfo;
  } catch (error) {
    console.error("Error fetching book information:", error);
    return null;
  }
};

export default function BookProposal() {
  const { user } = useAuth();
  const {
    currentBook,
    nextSelector,
    proposeBook
  } = useBookClub();

  const [isManualEntry, setIsManualEntry] = useState(false);
  const [isbn, setIsbn] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    pageCount: 0,
    coverUrl: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ratings: {} as { [key: string]: number },
    currentPage: 0,
    discussionTopics: [] as Array<{ id: string; text: string; createdAt: string; }>
  });

  const handleIsbnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const bookData = await fetchBookFromGoogleBooks(isbn);
      setNewBook(prev => ({
        ...prev,
        ...bookData
      }));
      setIsManualEntry(true); // Switch to manual mode to let user verify/edit the data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch book data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !nextSelector || nextSelector.id !== user.id) return;

    proposeBook({
      ...newBook,
      selectedBy: user.id
    });
  };

  if (!user || !nextSelector) return null;

  // Show the book setup phase if a book is approved
  if (currentBook?.status === 'setup') {
    return <BookSetup />;
  }

  // Show the proposal form if it's the user's turn to select
  if (nextSelector.id === user.id && (!currentBook || currentBook.status === 'vetoed')) {
    if (!isManualEntry) {
      return (
        <div className="space-y-6">
          <form onSubmit={handleIsbnSubmit} className="space-y-4">
            <div>
              <label className="label">Book ISBN</label>
              <input
                type="text"
                className="input"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="Enter 10 or 13-digit ISBN (e.g., 1847927491)"
                pattern="^(?:\d{10}|\d{13}|[\d-]{13,17})$"
                title="Please enter a valid 10 or 13-digit ISBN"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button 
              type="submit" 
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Search by ISBN'}
            </button>
          </form>
          <button
            onClick={() => setIsManualEntry(true)}
            className="btn-secondary w-full"
          >
            Enter Book Details Manually
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <button
          onClick={() => setIsManualEntry(false)}
          className="btn-secondary w-full mb-4"
        >
          Search by ISBN Instead
        </button>
        <form onSubmit={handlePropose} className="space-y-6">
          <div>
            <label className="label">Book Title</label>
            <input
              type="text"
              className="input"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Author</label>
            <input
              type="text"
              className="input"
              value={newBook.author}
              onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">Page Count</label>
              <input
                type="number"
                className="input"
                value={newBook.pageCount || ''}
                onChange={(e) => setNewBook({ ...newBook, pageCount: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <label className="label">Cover URL (optional)</label>
              <input
                type="url"
                className="input"
                value={newBook.coverUrl}
                onChange={(e) => setNewBook({ ...newBook, coverUrl: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                className="input"
                value={newBook.startDate}
                onChange={(e) => setNewBook({ ...newBook, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">End Date</label>
              <input
                type="date"
                className="input"
                value={newBook.endDate}
                onChange={(e) => setNewBook({ ...newBook, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">
            Propose Book
          </button>
        </form>
      </div>
    );
  }

  return null;
} 