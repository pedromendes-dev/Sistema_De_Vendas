import { Request, Response, NextFunction } from 'express';

export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationOptions;
}

// Middleware to parse pagination parameters
export const parsePagination = (req: Request, res: Response, next: NextFunction) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;

  req.pagination = {
    page,
    limit,
    offset
  };

  next();
};

// Helper to create paginated response
export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      offset: (page - 1) * limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

// Helper to get pagination info from request
export const getPaginationInfo = (req: Request) => {
  return req.pagination || { page: 1, limit: 20, offset: 0 };
};

// Declare pagination property on Request interface
declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
        offset: number;
      };
    }
  }
}
