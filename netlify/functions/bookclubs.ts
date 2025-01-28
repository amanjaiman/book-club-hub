import { Handler } from '@netlify/functions';
import { connectToDatabase } from './utils/mongodb';

interface BookClub {
  id: string;
  name: string;
  ownerId: string;
  members: string[];
  inviteCode: string;
}

export const handler: Handler = async (event) => {
  const { db } = await connectToDatabase();
  const bookClubs = db.collection<BookClub>('bookclubs');

  try {
    switch (event.httpMethod) {
      case 'GET': {
        const inviteCode = event.queryStringParameters?.inviteCode;
        const userId = event.queryStringParameters?.userId;
        
        if (inviteCode) {
          const bookClub = await bookClubs.findOne({ inviteCode });
          return {
            statusCode: 200,
            body: JSON.stringify(bookClub || null)
          };
        }

        if (userId) {
          const userBookClubs = await bookClubs.find({ members: userId }).toArray();
          return {
            statusCode: 200,
            body: JSON.stringify(userBookClubs)
          };
        }

        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Either inviteCode or userId is required' })
        };
      }

      case 'POST': {
        if (!event.body) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Request body is required' })
          };
        }

        const bookClubData = JSON.parse(event.body);
        const { name, ownerId } = bookClubData;

        // Create new book club
        const newBookClub: BookClub = {
          id: Date.now().toString(),
          name,
          ownerId,
          members: [ownerId],
          inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase()
        };

        await bookClubs.insertOne(newBookClub);
        return {
          statusCode: 201,
          body: JSON.stringify(newBookClub)
        };
      }

      case 'PATCH': {
        if (!event.body) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Request body is required' })
          };
        }

        const { id, updates } = JSON.parse(event.body);
        if (!id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Book club ID is required' })
          };
        }

        const result = await bookClubs.findOneAndUpdate(
          { id },
          { $set: updates },
          { returnDocument: 'after' }
        );

        if (!result) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Book club not found' })
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
    console.error('Error handling book clubs:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}; 