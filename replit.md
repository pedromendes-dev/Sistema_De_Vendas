# Sales Management System

## Overview

This is a full-stack sales management application built with React, Express, TypeScript, and PostgreSQL. The system allows users to manage sales attendants and register sales transactions with real-time earnings tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Validation**: Zod schemas for request/response validation
- **Development**: Hot reload with tsx

### Key Components

#### Database Schema
- **Attendants Table**: Stores attendant information (id, name, imageUrl, earnings)
- **Sales Table**: Tracks individual sales transactions (id, attendantId, value, createdAt)
- **Relationships**: One-to-many between attendants and sales

#### API Endpoints
- `GET /api/attendants` - Retrieve all attendants
- `GET /api/attendants/:id` - Retrieve specific attendant
- `POST /api/attendants` - Create new attendant
- `GET /api/sales` - Retrieve all sales
- `GET /api/sales/attendant/:id` - Retrieve sales by attendant
- `POST /api/sales` - Create new sale record

#### Storage Layer
- **Interface**: IStorage defining data access methods
- **Implementation**: DatabaseStorage using PostgreSQL with Drizzle ORM
- **Database**: PostgreSQL with Neon Database (serverless)

#### UI Components
- **Card-based Layout**: Clean, modern interface using shadcn/ui cards
- **Responsive Design**: Mobile-first approach with Tailwind utilities
- **Toast Notifications**: User feedback for actions
- **Form Controls**: Validated inputs for sale registration

## Data Flow

1. **Attendant Selection**: User selects an attendant from the displayed cards
2. **Sale Input**: User enters sale value in a validated form
3. **API Request**: Form submission triggers POST to `/api/sales`
4. **Database Update**: Sale record created and attendant earnings updated
5. **UI Refresh**: TanStack Query invalidates and refetches attendant data
6. **User Feedback**: Toast notification confirms success or error

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL provider
- **Connection**: Uses `@neondatabase/serverless` driver
- **Migrations**: Drizzle Kit for schema management

### UI Framework
- **shadcn/ui**: Pre-built accessible components
- **Radix UI**: Headless UI primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library

### Development Tools
- **TypeScript**: Type safety across the full stack
- **ESBuild**: Fast bundling for production
- **Vite**: Development server and build tool
- **Replit Integration**: Development environment optimizations

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: ESBuild bundles Express server to `dist/index.js`
3. **Assets**: Static files served from the build directory

### Environment Configuration
- **Development**: Uses tsx for hot reload, Vite dev server
- **Production**: Compiled JavaScript with static file serving
- **Database**: Environment variable `DATABASE_URL` for connection

### Scripts
- `npm run dev`: Development mode with hot reload
- `npm run build`: Production build for both frontend and backend
- `npm run start`: Run production build
- `npm run db:push`: Push database schema changes

### Hosting Considerations
- **Static Files**: Frontend assets served by Express in production
- **Database**: Requires PostgreSQL connection string
- **Environment**: Node.js runtime with ESM support required

## Recent Changes
- 2025-07-09: Removed Supabase connection button from Header component
- 2025-07-09: Implemented admin authentication with PostgreSQL database
- 2025-07-09: Created admin user with credentials (username: administrador, password: root123)
- 2025-07-09: Removed DemoWarning component from all pages
- 2025-07-09: Full transition to PostgreSQL database with persistent data storage