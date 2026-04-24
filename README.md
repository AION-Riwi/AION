# AION - Restaurant Management System

A modern restaurant reservation and management system built with Next.js, following Clean Architecture principles with strict separation of concerns.

## Tech Stack

- **Framework**: Next.js 16.2.4 + React 19.2.4
- **Database**: PostgreSQL + Prisma ORM 7.7.0
- **Authentication**: JWT tokens + bcrypt password hashing
- **Styling**: TailwindCSS v4
- **Language**: TypeScript 5
- **Validation**: Zod schemas
- **Logging**: Custom logger with multiple levels

## Architecture

This project follows **Clean Architecture** with clear layer separation:

```
┌─────────────────────────────────────┐
│          Presentation Layer         │
│      (Next.js App Router + API)     │
├─────────────────────────────────────┤
│         Application Layer           │
│   (Use Cases, DTOs, Services)       │
├─────────────────────────────────────┤
│          Domain Layer               │
│    (Entities, Business Rules)       │
├─────────────────────────────────────┤
│       Infrastructure Layer          │
│  (Repositories, External APIs)    │
└─────────────────────────────────────┘
```

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   ├── reservar/                 # Reservation pages
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── application/                  # Use Cases (empty - ready for expansion)
│
├── components/                   # React Components
│   └── ChatComponent.tsx         # AI Chat component
│
├── dtos/                         # Data Transfer Objects (empty - ready for expansion)
│
├── lib/                          # Infrastructure & Services
│   ├── ai/                       # AI integration
│   ├── config/                   # Environment configuration
│   ├── db/                       # Database utilities
│   ├── errors/                   # Custom error classes
│   ├── logger/                   # Logging system
│   ├── prisma.ts                 # Prisma client singleton
│   ├── repository/               # Data access layer
│   │   └── userRepository.ts     # User CRUD operations
│   └── services/                 # Business services
│       ├── bcryptPasswordService.ts    # Password hashing
│       ├── jwtTokenService.ts          # JWT token management
│       └── refreshTokenService.ts      # Refresh token rotation
│
├── schemas/                      # Zod validation schemas
│   └── auth.ts                   # Authentication schemas
│
├── types/                        # TypeScript type definitions
│   ├── index.ts                  # Main types (users, inputs)
│   └── services.ts               # Service interfaces
│
└── vectorUtils.ts                # Vector/AI utilities
```

## Database Schema

### Users & Authentication
- **users**: Core user entity with roles (customer, staff, admin)
- **user_levels**: Gamification system (levels, XP, visits)

### Restaurant Operations
- **restaurants**: Restaurant information
- **tables**: Table management with QR codes
- **menu_items**: Food/drink items with inventory
- **orders**: Order processing
- **order_items**: Order line items
- **reservations**: Table reservations
- **sales**: Transaction records
- **rewards**: Customer loyalty rewards

## Features

### Authentication System
- **Password Security**: bcrypt hashing with configurable salt rounds (10-14)
- **JWT Tokens**: Short-lived access tokens with Zod-validated payloads
- **Role-Based Access**: Three distinct roles (customer, staff, admin)
- **Registration Types**:
  - `CustomerRegisterSchema`: Basic registration (customers only)
  - `StaffRegisterSchema`: Employee registration with location and position
  - `AdminRegisterSchema`: Admin registration with location

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (`!@#$%^&*(),.?":{}|<>`)

### Logger System
Four log levels: DEBUG (0), INFO (1), WARN (2), ERROR (3)
Configurable via `LOG_LEVEL` environment variable

## Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/aion"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="15m"

# Password Hashing
SALT_ROUNDS="12"

# Logging
LOG_LEVEL="INFO"

# Optional: Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 4. Production Build
```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Development server with hot reload
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint code checking

## Key Services

### UserRepository (`src/lib/repository/userRepository.ts`)
- `findByEmail(email, forAuth?)` - Find user by email
- `findById(id, forAuth?)` - Find user by ID
- `create(data)` - Create new user with hashed password
- `update(id, data)` - Update user fields
- `deleteById(id)` - Soft delete user
- `mapToSafeUser(data)` - Remove password from user object

### PasswordService (`src/lib/services/bcryptPasswordService.ts`)
- `hash(password)` - Hash password with bcrypt
- `compare(password, hash)` - Verify password against hash
- Lazy salt rounds caching for performance

### JwtTokenService (`src/lib/services/jwtTokenService.ts`)
- `generateToken(payload)` - Create JWT access token
- `verifyToken(token)` - Validate and decode JWT
- `decodeToken(token)` - Decode without verification

## Validation Schemas

All inputs validated with Zod:

```typescript
// Customer registration
CustomerRegisterSchema: { name, email, password }

// Staff registration
StaffRegisterSchema: { name, email, password, locationName, position }

// Admin registration
AdminRegisterSchema: { name, email, password, locationName }
```

## Architecture Rules

1. **No business logic in routes** - Routes only validate and call use cases
2. **Repository pattern** - All database access through repositories
3. **DTO pattern** - Data transformation at boundaries
4. **Service pattern** - External logic (hashing, JWT) in services
5. **Zod validation** - All inputs validated before processing
6. **No `any` types** - Explicit types everywhere
7. **Max 16 lines per function** - Single responsibility
8. **Max 3 parameters** - Use objects for complex inputs

## Branch: feature/register

This branch contains the complete user registration system:
- Multi-role registration schemas
- Secure password hashing
- JWT token generation
- Repository pattern implementation
- Comprehensive error handling
- Full English documentation

## License

Private - All rights reserved.
