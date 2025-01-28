import { Handler } from '@netlify/functions';
import { connectToDatabase } from './utils/mongodb';

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

export const handler: Handler = async (event) => {
  // Extract book club ID from path
  const bookClubId = event.path.split('/').pop();
  console.log('Handling request for book club:', bookClubId);
  
  if (!bookClubId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Book club ID is required' })
    };
  }

  const { db } = await connectToDatabase();
  const states = db.collection<BookClubState>('bookclub_states');

  try {
    switch (event.httpMethod) {
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
          return {
            statusCode: 200,
            body: JSON.stringify(defaultState)
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify(state)
        };
      }

      case 'PATCH': {
        console.log('PATCH request for book club state');
        if (!event.body) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Request body is required' })
          };
        }

        const updates = JSON.parse(event.body);
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
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Book club state not found' })
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify(result)
        };
      }

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Error handling book club state:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}; 