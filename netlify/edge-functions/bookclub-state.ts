import { Context } from '@netlify/edge-functions';
import { connectToDatabase } from '../shared/mongodb';

interface Book {
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
  }>;
  votes: { [memberId: string]: 'approve' | 'veto' };
  description?: string;
  category?: string;
}

interface Meeting {
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  notes?: string;
  targetPage: number;
}

interface Member {
  id: string;
  name: string;
  email: string;
}

interface BookClubState {
  bookClubId: string;
  currentBook: Book | null;
  bookHistory: Book[];
  nextSelector: Member | null;
}

export default async function handler(request: Request, context: Context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers
    });
  }

  // Extract book club ID from URL
  const url = new URL(request.url);
  const bookClubId = url.pathname.split('/').pop();
  console.log('Handling request for book club:', bookClubId);
  
  if (!bookClubId) {
    return new Response(JSON.stringify({ error: 'Book club ID is required' }), {
      status: 400,
      headers
    });
  }

  const { db } = await connectToDatabase();
  const states = db.collection<BookClubState>('bookclub_states');

  try {
    switch (request.method) {
      case 'GET': {
        console.log('GET request for book club state');
        const state = await states.findOne({ bookClubId });
        console.log('Found state:', state);
        
        if (!state) {
          console.log('No state found, creating default state');
          // Return default empty state if none exists
          const defaultState = {
            bookClubId,
            currentBook: null,
            bookHistory: [],
            nextSelector: null
          };
          
          await states.insertOne(defaultState);
          return new Response(JSON.stringify(defaultState), {
            status: 200,
            headers
          });
        }

        return new Response(JSON.stringify(state), {
          status: 200,
          headers
        });
      }

      case 'PATCH': {
        console.log('PATCH request for book club state');
        const updates = await request.json();
        console.log('Updating state with:', updates);
        
        // First get the existing state
        const existingState = await states.findOne({ bookClubId });
        console.log('Existing state:', existingState);

        // Create a new state object that preserves the structure
        const newState = {
          bookClubId,
          currentBook: updates.currentBook ?? existingState?.currentBook ?? null,
          bookHistory: updates.bookHistory ?? existingState?.bookHistory ?? [],
          nextSelector: updates.nextSelector ?? existingState?.nextSelector ?? null
        };
        console.log('New state to save:', newState);

        const result = await states.findOneAndUpdate(
          { bookClubId },
          { $set: newState },
          { upsert: true, returnDocument: 'after' }
        );

        console.log('Update result:', result);

        if (!result) {
          return new Response(JSON.stringify({ error: 'Book club state not found' }), {
            status: 404,
            headers
          });
        }

        return new Response(JSON.stringify(result), {
          status: 200,
          headers
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers
        });
    }
  } catch (error) {
    console.error('Error handling book club state:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers
    });
  }
} 