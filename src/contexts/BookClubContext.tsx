import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Member {
  id: string;
  name: string;
  email: string;
}

interface Meeting {
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  notes?: string;
  targetPage: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  selectedBy: string;
  status: 'proposed' | 'approved' | 'setup' | 'reading' | 'completed' | 'vetoed';
  startDate: string;
  endDate: string;
  ratings: { [userId: string]: number };
  coverUrl?: string;
  pageCount: number;
  currentPage: number;
  meetings: Meeting[];
  discussions: Array<{
    id: string;
    userId: string;
    content: string;
    timestamp: string;
  }>;
  discussionTopics: Array<{
    id: string;
    text: string;
    createdAt: string;
  }>;
  votes: { [memberId: string]: 'approve' | 'veto' };
  description?: string;
  category?: string;
}

interface BookClubContextType {
  currentBook: Book | null;
  bookHistory: Book[];
  members: Member[];
  nextSelector: Member | null;
  refreshData: () => Promise<void>;
  addMember: (member: Member) => void;
  removeMember: (memberId: string) => void;
  proposeBook: (book: Omit<Book, 'id' | 'status' | 'votes' | 'discussions' | 'meetings'>) => void;
  voteOnBook: (vote: 'approve' | 'veto') => void;
  addDiscussion: (content: string) => void;
  addDiscussionTopic: (content: string) => void;
  clearDiscussionTopics: () => void;
  updateReadingProgress: (currentPage: number) => void;
  spinWheel: () => void;
  selectNextReader: (memberId: string) => void;
  updateBookSetup: (bookId: string, meetings: Meeting[]) => void;
  startReading: () => void;
  stopReading: () => void;
  rateBook: (bookId: string, rating: number) => void;
}

const BookClubContext = createContext<BookClubContextType | null>(null);

export function useBookClub() {
  const context = useContext(BookClubContext);
  if (!context) {
    throw new Error('useBookClub must be used within a BookClubProvider');
  }
  return context;
}

export function BookClubProvider({ children }: { children: ReactNode }) {
  const { user, bookClub } = useAuth();
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [bookHistory, setBookHistory] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [nextSelector, setNextSelector] = useState<Member | null>(null);

  // Function to load fresh state from MongoDB
  const loadState = async () => {
    if (!bookClub || !user) return;

    try {
      console.log('Loading state for book club:', bookClub.id);
      
      // Initialize members from the book club
      const memberPromises = bookClub.members.map(async (memberId) => {
        const response = await fetch(`/.netlify/functions/users?id=${memberId}`);
        if (!response.ok) {
          console.error(`Failed to fetch member ${memberId}`);
          return null;
        }
        const userData = await response.json();
        if (!userData) {
          console.error(`No user data found for member ${memberId}`);
          return null;
        }
        return userData;
      });

      const bookClubMembers = (await Promise.all(memberPromises)).filter((member): member is Member => member !== null);
      console.log('Loaded members:', bookClubMembers);
      setMembers(bookClubMembers);

      // Load book club state
      const stateResponse = await fetch(`/.netlify/functions/bookclub-state/${bookClub.id}`);
      if (!stateResponse.ok) throw new Error('Failed to fetch book club state');
      
      const state = await stateResponse.json();
      console.log('Loaded state from MongoDB:', state);

      // Set state all at once to avoid race conditions
      if (state) {
        setCurrentBook(state.currentBook || null);
        setBookHistory(state.bookHistory || []);
        
        if (state.nextSelector) {
          const selectorMember = bookClubMembers.find(m => m.id === state.nextSelector.id) || state.nextSelector;
          setNextSelector(selectorMember);
        } else {
          setNextSelector(null);
        }
      }
    } catch (error) {
      console.error('Error loading book club state:', error);
    }
  };

  // Load state on mount and when bookClub changes
  useEffect(() => {
    loadState();
  }, [bookClub?.id]);

  // Refresh data every minute when the tab is visible
  useEffect(() => {
    if (!document.hidden) {
      const interval = setInterval(loadState, 60000);
      return () => clearInterval(interval);
    }
  }, [bookClub?.id]);

  // Refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadState();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [bookClub?.id]);

  // Save state to MongoDB whenever it changes
  useEffect(() => {
    if (!bookClub) return;

    const saveState = async () => {
      try {
        // Only save if we have actual changes to save
        if (!currentBook && !nextSelector && bookHistory.length === 0) return;

        const state = {
          bookClubId: bookClub.id,
          currentBook,
          bookHistory,
          nextSelector: nextSelector ? {
            id: nextSelector.id,
            name: nextSelector.name,
            email: nextSelector.email
          } : null
        };

        console.log('Saving state to MongoDB:', state);

        const response = await fetch(`/.netlify/functions/bookclub-state/${bookClub.id}`, {
          method: 'PATCH',
          body: JSON.stringify(state)
        });

        if (!response.ok) {
          throw new Error('Failed to save state');
        }

        // Fetch fresh data after saving to ensure we have the latest state
        await loadState();
      } catch (error) {
        console.error('Error saving book club state:', error);
      }
    };

    saveState();
  }, [bookClub, currentBook, bookHistory, nextSelector]);

  const addMember = (member: Member) => {
    setMembers([...members, member]);
  };

  const removeMember = (memberId: string) => {
    setMembers(members.filter(m => m.id !== memberId));
  };

  const proposeBook = (book: Omit<Book, 'id' | 'status' | 'votes' | 'discussions' | 'meetings'>) => {
    if (!user || !nextSelector || nextSelector.id !== user.id) return;

    const newBook: Book = {
      ...book,
      id: crypto.randomUUID(),
      status: 'proposed',
      votes: {},
      discussions: [],
      meetings: [],
      discussionTopics: []
    };

    setCurrentBook(newBook);
  };

  const voteOnBook = (vote: 'approve' | 'veto') => {
    if (!user || !currentBook || currentBook.status !== 'proposed') return;

    const updatedBook = {
      ...currentBook,
      votes: {
        ...currentBook.votes,
        [user.id]: vote
      }
    };

    // Get voting members (excluding the proposer)
    const votingMembers = members.filter(m => m.id !== currentBook.selectedBy);
    
    // Check if all voting members have voted
    const totalVotes = Object.keys(updatedBook.votes).length;
    if (totalVotes === votingMembers.length) {
      const vetoCount = Object.values(updatedBook.votes).filter(v => v === 'veto').length;
      // Check if majority of voters vetoed (50% or more)
      if (vetoCount <= votingMembers.length / 2) {
        // If less than majority vetoed, move to setup phase
        updatedBook.status = 'setup';
        setNextSelector(null);
      } else {
        // If majority vetoed, reject the book
        updatedBook.status = 'vetoed';
      }
      console.log('All members voted. New status:', updatedBook.status);
    }

    setCurrentBook(updatedBook);
  };

  const addDiscussion = (content: string) => {
    if (!user || !currentBook) return;

    const newDiscussion = {
      id: crypto.randomUUID(),
      userId: user.id,
      content,
      timestamp: new Date().toISOString()
    };

    setCurrentBook({
      ...currentBook,
      discussions: [...currentBook.discussions, newDiscussion]
    });
  };

  const addDiscussionTopic = (content: string) => {
    if (!user || !currentBook) return;

    const newTopic = {
      id: crypto.randomUUID(),
      text: content,
      createdAt: new Date().toISOString()
    };

    setCurrentBook({
      ...currentBook,
      discussionTopics: [...currentBook.discussionTopics, newTopic]
    });
  };

  const clearDiscussionTopics = () => {
    if (!user || !currentBook || user.id !== currentBook.selectedBy) return;

    setCurrentBook({
      ...currentBook,
      discussionTopics: []
    });
  };

  const updateReadingProgress = (currentPage: number) => {
    if (!currentBook || !user) return;

    setCurrentBook({
      ...currentBook,
      currentPage
    });
  };

  const spinWheel = () => {
    if (!members.length) return;
    const randomIndex = Math.floor(Math.random() * members.length);
    setNextSelector(members[randomIndex]);
  };

  const selectNextReader = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setNextSelector(member);
    }
  };

  const updateBookSetup = (bookId: string, meetings: Meeting[]) => {
    if (!currentBook || currentBook.id !== bookId) return;

    setCurrentBook({
      ...currentBook,
      meetings,
      status: 'setup'
    });
  };

  const startReading = () => {
    if (!currentBook || currentBook.status !== 'setup') return;

    setCurrentBook({
      ...currentBook,
      status: 'reading',
      startDate: new Date().toISOString()
    });
  };

  const stopReading = () => {
    if (!currentBook || currentBook.status !== 'reading') return;

    const completedBook = {
      ...currentBook,
      status: 'completed' as const,
      endDate: new Date().toISOString()
    };

    setBookHistory([...bookHistory, completedBook]);
    setCurrentBook(null);
  };

  const rateBook = (bookId: string, rating: number) => {
    if (!user) return;

    const book = currentBook?.id === bookId ? currentBook : bookHistory.find(b => b.id === bookId);
    if (!book) return;

    const updatedBook = {
      ...book,
      ratings: {
        ...book.ratings,
        [user.id]: rating
      }
    };

    if (book === currentBook) {
      setCurrentBook(updatedBook);
    } else {
      setBookHistory(bookHistory.map(b => b.id === bookId ? updatedBook : b));
    }
  };

  const value = {
    currentBook,
    bookHistory,
    members,
    nextSelector,
    refreshData: loadState,
    addMember,
    removeMember,
    proposeBook,
    voteOnBook,
    addDiscussion,
    addDiscussionTopic,
    clearDiscussionTopics,
    updateReadingProgress,
    spinWheel,
    selectNextReader,
    updateBookSetup,
    startReading,
    stopReading,
    rateBook
  };

  return (
    <BookClubContext.Provider value={value}>
      {children}
    </BookClubContext.Provider>
  );
} 