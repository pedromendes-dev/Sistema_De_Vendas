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
- 2025-07-09: **SUPER ADVANCED ATTENDANT MANAGEMENT SYSTEM** - Comprehensive overhaul with professional-grade features
- 2025-07-09: Advanced action buttons with 12+ functions per attendant including WhatsApp integration, data export, QR generation
- 2025-07-09: Multiple attendant view modes with enhanced card layouts featuring 3-row button organization
- 2025-07-09: Professional bulk operations including CSV export, data synchronization, team motivation tools
- 2025-07-09: Smart statistics dashboard with gradient cards showing total, active attendants, sales totals, and averages
- 2025-07-09: Advanced admin toolset with copy-to-clipboard, share reports, download images, and export data functions
- 2025-07-09: Enhanced search functionality with multiple sorting options and intuitive filter controls
- 2025-07-09: Complete attendant status management system with activate/deactivate toggle functionality
- 2025-07-09: Professional tabular view with comprehensive action buttons and responsive design
- 2025-07-09: Detailed view mode with organized action groups and visual hierarchy improvements
- 2025-07-14: **PRODUCTION READY SYSTEM** - Complete cleaning of demo data and production setup
- 2025-07-14: Professional notification system replacing intrusive notification components
- 2025-07-14: Comprehensive system configuration panel for business customization
- 2025-07-14: Complete database cleanup removing all fake/demo data for production use
- 2025-07-14: QuickStartGuide component for new business onboarding and setup
- 2025-07-14: Created migration documentation and automated deployment scripts
- 2025-07-14: Added "Configurações" tab to admin panel with SystemConfiguration component
- 2025-07-14: System now shows QuickStartGuide when no attendants exist (clean slate)
- 2025-07-14: Recreated clean admin user (administrador/root123) for production
- 2025-07-14: **VERCEL DEPLOY PREPARATION** - Complete deployment setup for production hosting
- 2025-07-14: Created comprehensive Vercel configuration files (vercel.json, DEPLOY_VERCEL.md, DEPLOY_RESUMO.md)
- 2025-07-14: Added environment variables template (.env.example) and deployment script (deploy.sh)
- 2025-07-14: Updated .gitignore to protect sensitive files and deployment artifacts
- 2025-07-14: Prepared full documentation for GitHub repository setup and Vercel deployment
- 2025-07-14: System ready for production deployment with all configuration files in place
- 2025-07-14: **GITHUB READY PREPARATION** - Complete preparation for GitHub repository
- 2025-07-14: Created comprehensive README.md with full documentation and setup instructions
- 2025-07-14: Added proper .gitignore file excluding sensitive data and build artifacts  
- 2025-07-14: Created GITHUB_SETUP.md with step-by-step instructions for GitHub upload
- 2025-07-14: Fixed AttendantCard useToast import error preventing application crashes
- 2025-07-14: Improved scroll behavior removing excessive smooth scrolling for better UX
- 2025-07-14: Created compact 16x16 favicon with sales theme for browser tab
- 2025-07-14: Enhanced drag & drop grip handles with modern styling and better visibility
- 2025-07-14: System fully documented and ready for GitHub repository creation
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
- 2025-07-14: **INTELLIGENT SCREEN ADAPTATION ALGORITHM** - Revolutionary real-time interface optimization
- 2025-07-14: Implemented advanced device detection system with automatic screen metrics calculation
- 2025-07-14: Created adaptive hooks (useScreenAdapter, useComponentAdapter, useLayoutAdapter) for intelligent UI scaling
- 2025-07-14: Real-time breakpoint detection supporting mobile, tablet, desktop, and ultrawide displays
- 2025-07-14: Automatic touch detection and interaction optimization for touch vs non-touch devices
- 2025-07-14: Smart typography and spacing adaptation based on screen density and device pixel ratio
- 2025-07-14: Intelligent component sizing with device-specific optimizations (mobile vs desktop behaviors)
- 2025-07-14: AdaptiveContainer and AdaptiveGrid components for automatic layout optimization
- 2025-07-14: Universal compatibility system supporting ANY screen size from 320px to 4K+ displays
- 2025-07-14: Performance-optimized with debounced resize handlers and automatic cleanup
- 2025-07-14: AttendantCard component fully converted to intelligent adaptation system
- 2025-07-18: **SYSTEM COMPLETE WITH ALL FEATURES WORKING** - Finalized all three requested features successfully
- 2025-07-18: Client data capture system fully integrated into sales workflow with name, phone, email, and address fields
- 2025-07-18: Notification system cleaned and functional with proper character encoding and real-time updates
- 2025-07-18: Photo upload system implemented for attendant creation and editing with functional file handling
- 2025-07-18: Goals creation system debugged and working with proper field mapping and validation
- 2025-07-18: Database cleanup performed removing corrupted notification entries and system optimizations
- 2025-07-18: Build system verified working with no critical errors, all components properly integrated
- 2025-07-18: System ready for production deployment with all features tested and functional
- 2025-07-18: Removed "Organizar" tab from admin panel as requested by user - cleaned up drag-drop components
- 2025-07-18: **EDIT AND DELETE FUNCTIONALITY IMPLEMENTED** - Added complete edit/delete functionality for attendants page
- 2025-07-18: Fully functional edit modal with name and image URL fields plus preview functionality
- 2025-07-18: Delete functionality with confirmation dialog and proper error handling
- 2025-07-18: All backend routes (PUT, DELETE) already existed and are working properly
- 2025-07-18: Toast notifications for successful edits, deletions, and error handling