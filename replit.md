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
- 2025-07-09: **MAJOR MOBILE OPTIMIZATION UPDATE** - Implemented advanced mobile-first optimizations inspired by React Native and Flutter
- 2025-07-09: Added comprehensive mobile CSS utilities with GPU acceleration, haptic feedback, and native-like interactions
- 2025-07-09: Implemented Flutter-inspired animations (scale, slide, fade) with staggered delays for smooth entry animations
- 2025-07-09: Added React Native-style gesture handlers, touch optimizations, and scroll behaviors
- 2025-07-09: Integrated iOS Safari safe area support and mobile-specific viewport optimizations
- 2025-07-09: Applied backdrop blur effects, lazy loading, and intersection observer patterns for performance
- 2025-07-09: Enhanced typography rendering with antialiasing and optimized font smoothing
- 2025-07-09: Implemented mobile-native input scaling, button haptic feedback, and pressed states
- 2025-07-09: Fixed ranking page mobile layout with proper text spacing and responsive design
- 2025-07-09: Added admin login persistence across navigation tabs using localStorage
- 2025-07-09: Integrated comprehensive admin panel into "Área do Gestor" navigation tab
- 2025-07-09: Admin panel includes 6 complete management sections: Atendentes, Vendas, Metas, Conquistas, Organizar, Layout
- 2025-07-09: Implemented drag-and-drop content management with @dnd-kit libraries
- 2025-07-09: Created advanced DragDropManager, ContentBuilder, and DragDropTable components
- 2025-07-09: Fixed admin login authentication issues (credentials: administrador/root123)
- 2025-07-09: Implemented comprehensive sales goals and achievement system
- 2025-07-09: Added Goals page with create, track, and manage functionality
- 2025-07-09: Created leaderboard system with points and streak tracking
- 2025-07-09: Integrated automatic goal progress updates on sales creation
- 2025-07-09: Added achievement system with badges and notifications
- 2025-07-09: Extended database schema with goals, achievements, and leaderboard tables
- 2025-07-09: Updated navigation to include Goals section
- 2025-07-09: Removed Supabase connection button from Header component
- 2025-07-09: Implemented admin authentication with PostgreSQL database
- 2025-07-09: Created admin user with credentials (username: administrador, password: root123)
- 2025-07-09: Removed DemoWarning component from all pages
- 2025-07-09: Full transition to PostgreSQL database with persistent data storage
- 2025-07-09: **MOBILE-WEB UNIFICATION** - Unified mobile and web layouts per user request
- 2025-07-09: Removed mobile-specific layouts in ranking page - now uses same design for all devices
- 2025-07-09: Unified admin panel navigation tabs across all screen sizes with responsive grid
- 2025-07-09: Maintained responsive design while ensuring consistent visual experience
- 2025-07-09: Enhanced ranking cards with adaptive statistics display and unified card structure
- 2025-07-09: Removed demonstration credentials display from admin login page for security
- 2025-07-09: **FULL HEADER FUNCTIONALITY IMPLEMENTED** - Added complete functionality to all header buttons
- 2025-07-09: Functional notification center with live unread count badge and dropdown panel
- 2025-07-09: Comprehensive settings modal with sound, dark mode, auto-refresh, and compact view toggles
- 2025-07-09: Enhanced fullscreen toggle with proper state management and visual feedback
- 2025-07-09: Settings persistence through localStorage with automatic saving
- 2025-07-09: Click-outside detection for notification dropdown with proper cleanup
- 2025-07-09: Real-time notification updates with auto-refresh intervals (5 seconds)
- 2025-07-09: Complete mobile responsiveness for all header interactions
- 2025-07-09: **ADVANCED ATTENDANT MANAGEMENT SYSTEM** - Complete overhaul of attendant management interface
- 2025-07-09: Multiple view modes: Cards, Table, and Detailed views with enhanced statistics
- 2025-07-09: Advanced search and filtering system with real-time results
- 2025-07-09: Comprehensive sorting options (name, earnings, date) with toggle direction
- 2025-07-09: Rich attendant detail modal with complete performance analytics
- 2025-07-09: Statistics dashboard showing sales count, averages, goals, and achievements
- 2025-07-09: Recent sales history with timestamps and goal progress tracking
- 2025-07-09: Achievement gallery with badge colors and point totals
- 2025-07-09: Enhanced edit modal with image preview functionality
- 2025-07-09: Responsive grid layouts optimized for all screen sizes
- 2025-07-09: Performance metrics integration across attendant profiles
- 2025-07-09: Professional data visualization with color-coded statistics