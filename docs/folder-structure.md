# Folder Structure

```
sweet-basil-eventconnect/
├── docs/                          # Documentation
├── public/                        # Static assets
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── about/                 # About page
│   │   ├── admin/                 # Admin dashboard
│   │   │   ├── events/            # Event management
│   │   │   ├── uploads/           # Upload management
│   │   │   └── users/             # User management
│   │   ├── api/                   # API routes
│   │   │   ├── analytics/         # Admin analytics
│   │   │   ├── events/[id]/       # Event CRUD
│   │   │   ├── guest/join/        # Guest join API
│   │   │   ├── health/            # Health check
│   │   │   └── photos/            # Photo list & download
│   │   ├── auth/callback/         # OAuth callback
│   │   ├── contact/               # Contact page
│   │   ├── dashboard/             # User dashboard
│   │   ├── events/                # Event listing & gallery
│   │   │   └── [id]/              # Event detail + gallery
│   │   ├── join/[eventId]/        # QR join flow
│   │   ├── login/                 # Login page
│   │   ├── register/              # Registration page
│   │   ├── error.tsx              # 500 error page
│   │   ├── not-found.tsx          # 404 page
│   │   ├── globals.css            # Global styles
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Homepage
│   ├── components/
│   │   ├── admin/                 # Admin components
│   │   ├── events/                # Event components
│   │   ├── gallery/               # Gallery components
│   │   ├── layout/                # Header, footer
│   │   ├── upload/                # Upload components
│   │   └── ui/                    # shadcn/ui primitives
│   ├── lib/
│   │   ├── actions/               # Server actions
│   │   ├── auth/                  # Auth guards, guest sessions
│   │   ├── supabase/              # Supabase clients
│   │   ├── validations/           # Zod schemas
│   │   ├── compress-image.ts      # Client image compression
│   │   ├── qr.ts                  # QR code generation
│   │   ├── rate-limit.ts          # Rate limiting
│   │   └── utils.ts               # Utilities
│   ├── stores/                    # Zustand stores
│   ├── types/                     # TypeScript types
│   └── middleware.ts              # Route protection
├── supabase/
│   └── migrations/                # SQL migrations
├── tests/
│   ├── e2e/                       # Playwright tests
│   └── unit/                      # Vitest tests
├── .env.example                   # Environment template
├── components.json                # shadcn config
├── next.config.ts                 # Next.js config
├── package.json
├── playwright.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

## Key Conventions

- **Server Components** by default for data fetching
- **"use client"** only for interactive components
- **Server Actions** in `src/lib/actions/` for mutations
- **API Routes** for pagination, downloads, and external consumers
- **Zod schemas** in `src/lib/validations/` for all input validation
