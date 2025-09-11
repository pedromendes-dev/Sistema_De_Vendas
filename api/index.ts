import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { setupVite, serveStatic, log } from "../server/vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const method = req.method;
    
    log(`${method} ${path} - ${status} - ${duration}ms`);
    
    if (capturedJsonResponse && status >= 400) {
      log(`Error response: ${JSON.stringify(capturedJsonResponse, null, 2)}`);
    }
  });

  next();
});

// Register API routes
registerRoutes(app);

// Setup Vite for development
if (process.env.NODE_ENV === 'development') {
  // Note: setupVite requires a server parameter, but in Vercel functions
  // we don't have access to the HTTP server, so we'll skip Vite setup
  // and just serve static files
  serveStatic(app);
} else {
  // Serve static files in production
  serveStatic(app);
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all handler for SPA
app.get('*', (req: Request, res: Response) => {
  res.sendFile('index.html', { root: 'dist' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  log(`Error: ${err.message}`);
  log(`Stack: ${err.stack}`);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Export for Vercel
export default app;