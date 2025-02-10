import { Context } from '@netlify/edge-functions';
import { connectToDatabase } from '../shared/mongodb';

interface User {
  id: string;
  name: string;
  email: string;
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
    const users = db.collection<User>('users');

    switch (request.method) {
      case 'GET': {
        const url = new URL(request.url);
        const email = url.searchParams.get('email');
        const id = url.searchParams.get('id');
        
        if (email) {
          const user = await users.findOne({ email });
          return new Response(JSON.stringify(user || null), {
            status: 200,
            headers
          });
        }

        if (id) {
          const user = await users.findOne({ id });
          return new Response(JSON.stringify(user || null), {
            status: 200,
            headers
          });
        }

        const allUsers = await users.find().toArray();
        return new Response(JSON.stringify(allUsers), {
          status: 200,
          headers
        });
      }

      case 'POST': {
        const userData = await request.json();
        const { email, name } = userData;

        if (!email) {
          return new Response(JSON.stringify({ error: 'Email is required' }), {
            status: 400,
            headers
          });
        }

        // Check if user already exists
        const existingUser = await users.findOne({ email });
        if (existingUser) {
          return new Response(JSON.stringify(existingUser), {
            status: 200,
            headers
          });
        }

        // Create new user
        const newUser: User = {
          id: Date.now().toString(),
          name: name || email.split('@')[0],
          email
        };

        await users.insertOne(newUser);
        return new Response(JSON.stringify(newUser), {
          status: 201,
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
    console.error('Error handling users:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers
    });
  }
} 