import { Context } from '@netlify/edge-functions';
import { connectToDatabase } from './mongodb';

interface BookClub {
  id: string;
  name: string;
  ownerId: string;
  members: string[];
  inviteCode: string;
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

  try {
    const { db } = await connectToDatabase();
    const bookClubs = db.collection<BookClub>('bookclubs');

    switch (request.method) {
      case 'GET': {
        const url = new URL(request.url);
        const inviteCode = url.searchParams.get('inviteCode');
        const userId = url.searchParams.get('userId');
        
        if (inviteCode) {
          const bookClub = await bookClubs.findOne({ inviteCode });
          return new Response(JSON.stringify(bookClub || null), {
            status: 200,
            headers
          });
        }

        if (userId) {
          const userBookClubs = await bookClubs.find({ members: userId }).toArray();
          return new Response(JSON.stringify(userBookClubs), {
            status: 200,
            headers
          });
        }

        return new Response(JSON.stringify({ error: 'Either inviteCode or userId is required' }), {
          status: 400,
          headers
        });
      }

      case 'POST': {
        const bookClubData = await request.json();
        const { name, ownerId } = bookClubData;

        if (!name || !ownerId) {
          return new Response(JSON.stringify({ error: 'Name and ownerId are required' }), {
            status: 400,
            headers
          });
        }

        // Create new book club
        const newBookClub: BookClub = {
          id: Date.now().toString(),
          name,
          ownerId,
          members: [ownerId],
          inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase()
        };

        await bookClubs.insertOne(newBookClub);
        return new Response(JSON.stringify(newBookClub), {
          status: 201,
          headers
        });
      }

      case 'PATCH': {
        const { id, updates } = await request.json();
        if (!id) {
          return new Response(JSON.stringify({ error: 'Book club ID is required' }), {
            status: 400,
            headers
          });
        }

        const result = await bookClubs.findOneAndUpdate(
          { id },
          { $set: updates },
          { returnDocument: 'after' }
        );

        if (!result) {
          return new Response(JSON.stringify({ error: 'Book club not found' }), {
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
    console.error('Error handling book clubs:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers
    });
  }
} 