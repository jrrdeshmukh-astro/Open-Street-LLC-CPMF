# Open Street LLC - Codified Program Management Framework

## Overview

This is a comprehensive web application for Open Street LLC, showcasing their Codified Program Management Framework (CPMF). The framework provides a structured, compliant approach to multi-stakeholder engagement between government, industry, and academia. 

### Features
- **Public Landing Page**: Corporate marketing with framework details and contact information
- **Printable Trifold Brochure**: Print-ready marketing materials
- **Authenticated Dashboard**: Role-based access with 8 management tabs:
  - Workflow: Track progress across 5 CPMF components (Engagement, Governance, Facilitation, Analysis, Continuation)
  - Resources: Guides and interactive forms for each stage
  - Clients: Client intake and management
  - Time: Time tracking with timer functionality
  - Actions: Task and action item management
  - Billing: Invoice generation and tracking
  - Debrief: Standardized debrief templates
  - Messages: Async communication between stakeholders

### Key Terminology
- Uses "outcome agnostic" (not "neutral") for facilitator role
- Roles: admin, government_compliance_officer (admin-provisioned), industry_partner, academia (self-register)

### Contact
- Phone: +1(908)848-1562
- Website: www.openstreet.info

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **UI Components**: shadcn/ui component library (New York style variant)
- **State Management**: TanStack React Query for server state
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **Development**: tsx for TypeScript execution
- **Production**: esbuild bundles server code to CommonJS

### Data Storage
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema Location**: `shared/schema.ts` (shared between client/server)
- **Current Storage**: In-memory storage implementation (`MemStorage` class)
- **Database Ready**: Schema and Drizzle config prepared for PostgreSQL when provisioned

### Project Structure
```
├── client/           # Frontend React application
│   ├── src/
│   │   ├── components/ui/  # shadcn/ui components
│   │   ├── pages/          # Route pages (Home, Brochure)
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and query client
├── server/           # Backend Express application
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Data storage interface
│   └── vite.ts       # Vite dev server integration
├── shared/           # Shared code between client/server
│   └── schema.ts     # Drizzle database schema
└── migrations/       # Database migrations (Drizzle Kit)
```

### Key Design Patterns
- **Monorepo Structure**: Client, server, and shared code in single repository
- **Path Aliases**: `@/` for client source, `@shared/` for shared code
- **API Design**: RESTful endpoints prefixed with `/api`
- **Storage Interface**: Abstract `IStorage` interface allows swapping implementations

## External Dependencies

### UI Framework
- **Radix UI**: Headless UI primitives for accessible components
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management

### Data & Forms
- **Zod**: Schema validation
- **React Hook Form**: Form state management
- **Drizzle Zod**: Schema-to-Zod conversion

### Database
- **PostgreSQL**: Target database (requires `DATABASE_URL` environment variable)
- **Drizzle Kit**: Database migrations and schema push
- **connect-pg-simple**: PostgreSQL session store (available but not currently used)

### Development Tools
- **Vite**: Frontend build and dev server
- **esbuild**: Production server bundling
- **Replit Plugins**: Dev banner, cartographer, runtime error overlay