# ARCEM Construction Management Platform

## Overview

ARCEM is a full-stack construction company management platform built with React, Express, and PostgreSQL. The application serves as a comprehensive business website and administrative system for a construction company, featuring project portfolios, service listings, blog management, quote requests, job postings, team management, and vendor/subcontractor registration. The platform includes a public-facing website with SEO optimization and a protected admin dashboard for content management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite with hot module replacement
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives wrapped in shadcn/ui components
- **Rich Text**: TipTap editor for blog content
- **Drag & Drop**: dnd-kit for sortable interfaces

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (compiled with esbuild for production)
- **Authentication**: Passport.js with local strategy and express-session
- **Session Storage**: PostgreSQL via connect-pg-simple
- **API Design**: RESTful JSON APIs with Zod schema validation
- **File Structure**: Monorepo with `/client`, `/server`, and `/shared` directories

### Database Layer
- **Database**: PostgreSQL (via Neon serverless or standard Postgres)
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **Schema Location**: `/shared/schema.ts` contains all table definitions
- **Migration Strategy**: Push-based migrations with `drizzle-kit push`

### Data Models
Key entities include:
- Users (admin authentication)
- Projects with ProjectGallery (portfolio items)
- Services with ServiceGallery
- BlogPosts with categories, tags, and gallery
- QuoteRequests with file attachments
- Subcontractors and Vendors (partner registrations)
- JobPostings and TeamMembers
- Testimonials, Messages, Newsletter subscribers
- SiteSettings (configurable site options)

### File Upload System
- **Primary**: UploadThing for cloud file storage
- **Fallback**: Local file upload to `/public/uploads/`
- **Supported Types**: Images (16MB max), PDFs for quote attachments

### Build & Development
- Development: `npm run dev` runs tsx for server with Vite middleware
- Production: Vite builds client to `/dist/public`, esbuild bundles server to `/dist/index.js`
- Path aliases: `@/*` maps to `/client/src/*`, `@shared/*` maps to `/shared/*`

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Neon Serverless**: `@neondatabase/serverless` driver for serverless PostgreSQL connections

### File Storage
- **UploadThing**: Cloud file upload service
  - Requires `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` environment variables
  - Files are stored on UploadThing's CDN with URLs like `utfs.io` or `ufs.sh`

### Authentication
- Session secret via `SESSION_SECRET` environment variable
- Admin password initialization via `ADMIN_INITIAL_PASSWORD`

### Third-Party Integrations
- No external APIs for payment, email, or analytics are currently integrated
- Google Fonts loaded via CDN (Montserrat, Work Sans)

### Development Tools
- TypeScript for type safety across the stack
- ESLint/Prettier assumed for code formatting
- Database utility scripts in `/scripts/` for export, import, and schema generation