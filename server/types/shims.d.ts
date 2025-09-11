declare module 'bcryptjs';

// Ensure Express Request/Response helpers are recognized by TS in serverless envs
import 'express';
declare global {
  namespace Express {
    interface Request {}
    interface Response {}
  }
}

export {};

