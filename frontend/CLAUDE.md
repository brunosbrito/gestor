# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based construction cost management dashboard application built for the Brazilian market, featuring contract tracking, budget management, and purchase analytics. The app is built using modern React with TypeScript and shadcn/ui components.

## Development Commands

```bash
# Install dependencies
npm i

# Start development server
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

### Core Structure
- **Frontend Framework**: React 18 with TypeScript, Vite build tool
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Routing**: React Router DOM with hash-based navigation
- **Theming**: next-themes for dark/light mode support

### Key Directories
- `src/components/` - Main application components and UI modules
- `src/components/ui/` - shadcn/ui component library
- `src/components/modals/` - Modal components for forms and dialogs
- `src/hooks/` - Custom React hooks for business logic
- `src/services/` - API service layer and business logic
- `src/lib/` - Utility functions and configurations
- `src/pages/` - Route components

### Application Structure
The app uses a modular dashboard architecture:
- **Layout Component** (`src/components/Layout.tsx`): Main shell with sidebar navigation
- **Dashboard Modules**: Separate components for each business area (Contracts, Purchases, Analytics, etc.)
- **Service Layer**: Each module has corresponding service files for API calls and data management
- **Hook Pattern**: Custom hooks abstract business logic from components

### Data Flow
1. Components use custom hooks (e.g., `useContracts`, `usePurchases`)
2. Hooks call corresponding service functions
3. Services handle API communication and data transformation
4. TanStack Query manages caching and synchronization

### Key Business Modules
- **Contracts**: Construction project contract management
- **Purchases**: Purchase order and supplier management  
- **Budget**: Budget import and tracking functionality
- **Analytics**: Cost analysis and reporting
- **Accounts**: Account and financial data management
- **Goals**: Target and KPI management
- **Reports**: Report generation and export

### Styling Conventions
- Uses Tailwind CSS with custom color palette focused on construction industry
- Custom gradients and shadows defined in CSS variables
- Responsive design with mobile-first approach
- shadcn/ui provides consistent component patterns

### Internationalization
- Application is in Portuguese (Brazil)
- Currency formatting uses BRL (Brazilian Real)
- Date formatting follows Brazilian conventions

### Key Dependencies
- **UI**: @radix-ui components, lucide-react icons
- **Forms**: react-hook-form with zod validation
- **Charts**: recharts for data visualization
- **HTTP**: axios for API calls
- **Utils**: date-fns for date handling, clsx/tailwind-merge for styling

When working with this codebase:
1. Follow the existing modular pattern when adding new features
2. Use the established hook + service architecture
3. Maintain Brazilian Portuguese for user-facing text
4. Follow shadcn/ui patterns for new components
5. Use the existing utility functions in `src/lib/utils.ts`