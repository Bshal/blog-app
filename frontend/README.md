# Frontend Application

Next.js v16 application with App Router, shadcn UI, and TypeScript.

## Tech Stack

- **Next.js v16** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn UI** - Accessible component library (New York style)
- **Lucide React** - Icon library

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── [feature]/         # Feature-based routes (to be created)
│
├── components/            # React components
│   ├── ui/                # shadcn UI components (installed via CLI)
│   └── [feature]/        # Feature-specific components (to be created)
│
├── lib/                   # Utility libraries
│   └── utils.ts          # Utility functions (cn helper)
│
├── hooks/                 # Custom React hooks (to be created)
├── contexts/              # Context providers (to be created)
├── types/                 # TypeScript types (to be created)
└── public/                # Static assets
```

## Getting Started

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Path Aliases

The project uses TypeScript path aliases for cleaner imports:

- `@/components` → `./components`
- `@/lib` → `./lib`
- `@/hooks` → `./hooks`
- `@/*` → `./*` (root directory)

## shadcn UI

This project uses [shadcn UI](https://ui.shadcn.com) for accessible, customizable components.

### Adding Components

```bash
npx shadcn@latest add [component-name]
```

Components will be added to `components/ui/` directory.

### Configuration

shadcn UI is configured in `components.json`:
- Style: New York
- React Server Components: Enabled
- Tailwind CSS variables: Enabled
- Icon library: Lucide React

## Features to Implement

- [ ] Authentication pages (login, register)
- [ ] Blog post listing and detail pages
- [ ] Post creation and editing
- [ ] Comment system
- [ ] Admin panel
- [ ] User dashboard
- [ ] Protected routes
- [ ] OAuth integration (Google, Facebook)

## Architecture

- **App Router**: File-based routing with Next.js App Router
- **Server Components**: Default rendering on the server
- **Client Components**: Use `"use client"` directive when needed
- **Context API**: Global state management for authentication
- **TypeScript**: Full type safety throughout the application
