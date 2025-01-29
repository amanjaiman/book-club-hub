import { Handler } from '@netlify/functions';
import { connectToDatabase } from './utils/mongodb';

interface User {
  id: string;
  name: string;
  email: string;
}

export const handler: Handler = async (event) => {
  const { db } = await connectToDatabase();
  const users = db.collection<User>('users');

  try {
    switch (event.httpMethod) {
      case 'GET': {
        const email = event.queryStringParameters?.email;
        const id = event.queryStringParameters?.id;
        
        if (email) {
          const user = await users.findOne({ email });
          return {
            statusCode: 200,
            body: JSON.stringify(user || null)
          };
        }

        if (id) {
          const user = await users.findOne({ id });
          return {
            statusCode: 200,
            body: JSON.stringify(user || null)
          };
        }

        const allUsers = await users.find().toArray();
        return {
          statusCode: 200,
          body: JSON.stringify(allUsers)
        };
      }

      case 'POST': {
        if (!event.body) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Request body is required' })
          };
        }

        const userData = JSON.parse(event.body);
        const { email, name } = userData;

        // Check if user already exists
        const existingUser = await users.findOne({ email });
        if (existingUser) {
          return {
            statusCode: 200,
            body: JSON.stringify(existingUser)
          };
        }

        // Create new user
        const newUser: User = {
          id: Date.now().toString(),
          name: name || email.split('@')[0],
          email
        };

        await users.insertOne(newUser);
        return {
          statusCode: 201,
          body: JSON.stringify(newUser)
        };
      }

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Error handling users:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}; 