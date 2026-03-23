# DominicanGo API - Task Checklist

## Phase 1: Project Initialization
- [/] Initialize pnpm + install all dependencies
- [ ] Create tsconfig.json
- [ ] Create .env.example

## Phase 2: Core Files
- [ ] Create src/app.ts (Express setup, CORS, middlewares)
- [ ] Create src/server.ts (entry point)
- [ ] Create src/config/env.ts (env validation with Zod)

## Phase 3: Prisma Schema
- [ ] Create prisma/schema.prisma with all models
  - [ ] User
  - [ ] Province
  - [ ] Destination
  - [ ] Blog
  - [ ] Favorite (polymorphic)
  - [ ] VerificationCode

## Phase 4: Auth (Google OAuth2 + JWT)
- [ ] src/config/passport.ts
- [ ] src/modules/auth/auth.router.ts
- [ ] src/modules/auth/auth.controller.ts
- [ ] src/modules/auth/auth.service.ts
- [ ] src/modules/users/users.router.ts
- [ ] src/modules/users/users.controller.ts

## Phase 5: Email Service (Nodemailer + OTP)
- [ ] src/services/mail.service.ts
- [ ] src/services/otp.service.ts

## Phase 6: Destinations Module
- [ ] src/modules/destinations/destinations.router.ts
- [ ] src/modules/destinations/destinations.controller.ts
- [ ] src/modules/destinations/destinations.service.ts
- [ ] src/modules/destinations/destinations.schema.ts (Zod)

## Phase 7: Blogs Module
- [ ] src/modules/blogs/blogs.router.ts
- [ ] src/modules/blogs/blogs.controller.ts
- [ ] src/modules/blogs/blogs.service.ts
- [ ] src/modules/blogs/blogs.schema.ts (Zod)

## Phase 8: Favorites Module
- [ ] src/modules/favorites/favorites.router.ts
- [ ] src/modules/favorites/favorites.controller.ts
- [ ] src/modules/favorites/favorites.service.ts

## Phase 9: Shared Utilities
- [ ] src/middleware/auth.middleware.ts
- [ ] src/middleware/error.middleware.ts
- [ ] src/lib/prisma.ts (Prisma Client singleton)
- [ ] src/lib/jwt.ts (JWT helpers)
