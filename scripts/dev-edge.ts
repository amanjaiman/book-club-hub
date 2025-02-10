import { createServer, IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ExtendedError extends Error {
  code?: string;
}

// Cache for loaded functions
const functionCache = new Map<string, Function>();

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Parse URL to get the function name
    const url = new URL(req.url ?? '', `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/');
    
    // Extract the function name from the path
    // For bookclub-state/{id}, we want 'bookclub-state' as the function name
    let functionName = '';
    const edgeFunctionIndex = pathParts.indexOf('edge-functions');
    if (edgeFunctionIndex !== -1 && edgeFunctionIndex + 1 < pathParts.length) {
      functionName = pathParts[edgeFunctionIndex + 1];
    }

    // Check if this is a valid edge function request
    if (!url.pathname.startsWith('/.netlify/edge-functions/') || !functionName) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Function not found' }));
      return;
    }

    try {
      let handler;
      // Try to get the handler from cache
      if (functionCache.has(functionName)) {
        handler = functionCache.get(functionName);
        console.log(`Using cached handler for ${functionName}`);
      } else {
        // Import the edge function
        const functionPath = join(__dirname, '..', 'netlify', 'edge-functions', `${functionName}.ts`);
        const functionUrl = pathToFileURL(functionPath).href;
        console.log(`Loading edge function: ${functionUrl}`);
        
        const module = await import(functionUrl);
        handler = module.default;
        // Cache the handler
        functionCache.set(functionName, handler);
      }

      // Create a Request object from the incoming http.IncomingMessage
      let body: string | undefined;
      if (req.method !== 'GET') {
        // Read the request body for non-GET requests
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        body = Buffer.concat(chunks).toString();
      }

      const request = new Request(`http://${req.headers.host}${req.url}`, {
        method: req.method ?? 'GET',
        headers: new Headers(req.headers as Record<string, string>),
        body: body,
      });

      // Create a mock Context object
      const context = {
        next: async () => new Response('Not implemented'),
        ip: req.socket.remoteAddress ?? '',
        log: console.log,
      };

      // Call the edge function
      const response = await handler(request, context);

      // Write the response back
      res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
      res.end(await response.text());
    } catch (error) {
      console.error(`Error loading or executing edge function ${functionName}:`, error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: `Error executing edge function: ${error instanceof Error ? error.message : 'Unknown error'}` }));
    }
  } catch (error) {
    console.error('Error handling request:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

const PORT = process.env.PORT || 8888;

// Handle server startup
server.on('error', (error: ExtendedError) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server shut down successfully');
    process.exit(0);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Edge functions development server running at http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  /.netlify/edge-functions/users');
  console.log('  /.netlify/edge-functions/bookclubs');
  console.log('  /.netlify/edge-functions/bookclub-state');
}); 