import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface BookClub {
  id: string;
  name: string;
  ownerId: string;
  members: string[];
  inviteCode: string;
}

interface AuthContextType {
  user: User | null;
  bookClub: BookClub | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  createBookClub: (name: string) => Promise<void>;
  joinBookClub: (inviteCode: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [bookClub, setBookClub] = useState<BookClub | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount (we'll keep this for session persistence)
  useEffect(() => {
    const storedUser = localStorage.getItem('current_user');
    const storedBookClub = localStorage.getItem('current_bookclub');
    
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedBookClub) setBookClub(JSON.parse(storedBookClub));
    
    setIsLoading(false);
  }, []);

  // Save state to localStorage whenever it changes (for session persistence)
  useEffect(() => {
    if (user) localStorage.setItem('current_user', JSON.stringify(user));
    if (bookClub) localStorage.setItem('current_bookclub', JSON.stringify(bookClub));
  }, [user, bookClub]);

  const login = async (email: string) => {
    try {
      // Try to find or create user in MongoDB
      const response = await fetch('/.netlify/functions/users', {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      if (!response.ok) throw new Error('Failed to login');
      
      const userData = await response.json();
      setUser(userData);

      // Check if user is part of any book clubs
      const bookClubsResponse = await fetch(`/.netlify/functions/bookclubs?userId=${userData.id}`);
      if (!bookClubsResponse.ok) throw new Error('Failed to fetch book clubs');
      
      const userBookClubs = await bookClubsResponse.json();
      if (userBookClubs.length > 0) {
        setBookClub(userBookClubs[0]); // Set the first book club as active
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setBookClub(null);
    localStorage.removeItem('current_user');
    localStorage.removeItem('current_bookclub');
  };

  const createBookClub = async (name: string) => {
    if (!user) throw new Error('Must be logged in to create a book club');

    try {
      const response = await fetch('/.netlify/functions/bookclubs', {
        method: 'POST',
        body: JSON.stringify({ name, ownerId: user.id })
      });

      if (!response.ok) throw new Error('Failed to create book club');
      
      const newBookClub = await response.json();
      setBookClub(newBookClub);
    } catch (error) {
      console.error('Create book club error:', error);
      throw error;
    }
  };

  const joinBookClub = async (inviteCode: string) => {
    if (!user) throw new Error('Must be logged in to join a book club');

    try {
      // Find the book club with this invite code
      const response = await fetch(`/.netlify/functions/bookclubs?inviteCode=${inviteCode}`);
      if (!response.ok) throw new Error('Failed to find book club');
      
      const bookClubToJoin = await response.json();
      if (!bookClubToJoin) throw new Error('Invalid invite code');

      // Add the user to the book club
      const updateResponse = await fetch('/.netlify/functions/bookclubs', {
        method: 'PATCH',
        body: JSON.stringify({
          id: bookClubToJoin.id,
          updates: {
            members: [...bookClubToJoin.members, user.id]
          }
        })
      });

      if (!updateResponse.ok) throw new Error('Failed to join book club');
      
      const updatedBookClub = await updateResponse.json();
      setBookClub(updatedBookClub);
    } catch (error) {
      console.error('Join book club error:', error);
      throw error;
    }
  };

  const value = {
    user,
    bookClub,
    isLoading,
    login,
    logout,
    createBookClub,
    joinBookClub
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 