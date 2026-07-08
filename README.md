# Zenith Flow — Premium Project Management Dashboard

A production-grade, SaaS-quality Full Stack Project and Task Management Dashboard built for the **EnvisionStudio Web Developer Practical Assessment**. 

Zenith Flow is designed with a premium dark-themed aesthetic, utilizing fluid animations, glassmorphism, responsive grid sheets, and structured telemetry charts. It features a complete SQLite database backend powered by Prisma ORM 7, Next.js 16 App Router handlers, optimistic TanStack Query mutations, and drag-and-drop Kanban task boards.

---

## 🚀 Key Features

1. **Interactive Metrics Dashboard**:
   - 8 HSL-tinted KPI summary cards containing count-up number animations (using Framer Motion).
   - Proportional **Project Status Pie Chart** and volume-based **Task Status Bar Chart** powered by Recharts (guarded against SSR hydration mismatches).
   - Real-time audit activity feed logs and deadline alerts (overdue notifications).
   - Quick action command triggers to add projects and tasks.

2. **Projects Overview**:
   - Multi-layout toggle (structured HTML5 table on desktop, adaptive card deck on mobile screens).
   - Advanced fuzzy search queries targeting name/description fields via **Fuse.js**.
   - Sort filters (Name, Deadline, Status) and status pills (All, Active, Completed, On Hold).
   - Project edit options and cascading delete warnings.

3. **Detailed Project Roadmap (Kanban Board)**:
   - Dynamic dynamic path `/projects/[id]`.
   - Circular progress rings and progress bars displaying task completion percentages.
   - Drag-and-drop Kanban boards (Pending, In Progress, Completed columns) utilizing `@dnd-kit/core` and `@dnd-kit/sortable`.
   - Touch/click support on mobile screens allowing manual status shifting.
   - Burst of **canvas-confetti** explosions when a project hits 100% completion!

4. **Command Palette Center**:
   - Global keyboard trigger `Ctrl + K` or search bar click opens an overlay search interface.
   - Performs fuzzy queries across projects, subtasks, pages, and themes, enabling immediate workspace traversal.

5. **Premium UI/UX Theme Syncing**:
   - Customized Tailwind CSS global design system mapping adaptive glass backgrounds, custom inputs, and glowing interactive rings.
   - Dark/Light preference persistence through `localStorage`.
   - Form-level Zod schemas with inline error animation messages.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Compile Mode)
- **Database**: [SQLite](https://www.sqlite.org/) via [Prisma ORM 7](https://www.prisma.io/) (utilizing native driver adapters `better-sqlite3` and `@prisma/adapter-better-sqlite3`)
- **Query Caching & Mutations**: [TanStack React Query v5](https://tanstack.com/query/latest)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod Validation](https://zod.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Drag and Drop**: [@dnd-kit](https://dnd-kit.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Toasts**: [Sonner](https://theme-selection.com/sonner/)
- **Confetti**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Fuzzy Search**: [Fuse.js](https://www.fusejs.io/)

---

## 📂 Project Organization

```text
├── prisma/
│   ├── schema.prisma       # SQLite models (Project, Task, relations)
│   ├── seed.ts             # Seeds 10 Projects and 20 Tasks from assessment mock data
│   └── dev.db              # Active database file
├── src/
│   ├── actions/            # Server Actions for mutations (create, update, delete)
│   ├── app/                # App Router files (api, projects, global layouts, loading, errors)
│   │   ├── api/            # API Route Handlers (GET/POST/PUT/DELETE)
│   │   ├── projects/       # Projects pages & detail routes
│   │   ├── error.tsx       # Root error boundary
│   │   ├── global-error.tsx# Deep shell error boundary
│   │   ├── layout.tsx      # SEO and floating background layout
│   │   ├── loading.tsx     # Page-level skeleton loaders
│   │   ├── not-found.tsx   # Custom 404 handler
│   │   └── page.tsx        # Dashboard entry point
│   ├── components/         # Reusable layouts and atomic UI primitives
│   │   ├── layout/         # Sidebar, Navbar, Page templates
│   │   └── ui/             # Dialogs, Buttons, Inputs, Textareas, Badges, Progress indicators
│   ├── features/           # Feature views (Dashboard, Projects pages, Details, Kanban boards)
│   ├── hooks/              # Custom React hooks (keyboard navigation, custom triggers)
│   ├── lib/                # Database singleton configurations
│   ├── providers/          # Theme context, Query Clients, Toast containers
│   ├── types/              # Common TypeScript type definitions
│   └── utils/              # Tailwind merger, date-fns formats, Fuse.js configurations
├── prisma.config.ts        # Prisma 7 adapter configuration hook
└── package.json            # Application dependencies and scripts
```

---

## ⚙️ Setup & Installation Instructions

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### 1. Clone & Install Dependencies
Navigate to the root project directory and install the package modules:
```bash
npm install
```

### 2. Configure Database & Run Migrations
Run the initial Prisma migrations to bootstrap the local SQLite database:
```bash
npx prisma migrate dev --name init
```

### 3. Seed Database
Inject the 10 projects and 20 tasks supplied in the assessment mock dataset:
```bash
npx prisma db seed
```

### 4. Start Local Development Server
Launch the next development server:
```bash
npm run dev
```
Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to inspect Zenith Flow.

### 5. Production Compilations & Testing
Ensure the codebase is fully compliant with TypeScript strict mode and ESLint rules:
```bash
npm run build
```

---

## 📐 Architectural Decisions

- **Integer IDs**: In alignment with the provided mock data structure (e.g. `projectId: 1`), database primary keys are configured as integers (`Int @id @default(autoincrement())`). This removes string-to-number mapping overhead, optimizes join indexing, and matches relational expectations.
- **Server vs Client Split**: Data loading endpoints and page routings operate as Server Components, ensuring high SEO marks and fast initial load times. Interactions (like Kanban boards, charts, and modals) are isolated in Client Components and fetch telemetry via React Query wrappers.
- **Optimistic UI Updates**: TanStack React Query mutations cache-write updates immediately before the API responds. If the network layer encounters a constraint, changes are cleanly rolled back to prevent visual glitches.
- **Prisma 7 Compatibility**: Compliant with Prisma 7, connection adapters and SQLite setups are mapped using `@prisma/adapter-better-sqlite3` and defined inside `prisma.config.ts` rather than deprecated variables inside schema files.
