## JS Bank CMS Portal – Tech Stack & Database Overview

### Application Stack

- **Frontend framework**: **Next.js (React)** using the App Router (`src/app`) and client components for most UI.
- **Language**: **JavaScript (ESNext)** with modern React hooks (`useState`, `useEffect`) and server actions.
- **Styling/UI**:
  - **Tailwind CSS** utility classes for layout and responsive design.
  - Custom JS Bank design system (brand colors, typography) implemented via Tailwind classes.
  - Icon set from **`lucide-react`** for UI icons.
- **Authentication**:
  - **Google OAuth 2.0** for sign‑in (`/api/auth/signin/google`, `/api/auth/callback/google`).
  - **JWT-based sessions** stored in secure HTTP-only cookies (`JWT_SECRET`).
- **Authorization / Roles**:
  - Role-based access control via Prisma `User.role` (`Admin`, `IT Editor`, `Viewer`, etc.).
  - Role checks applied in the dashboard and Admin panel to control actions and visibility.
- **Backend runtime**:
  - **Node.js** server running the Next.js app.
  - Server actions under `src/actions/*` handle business logic (news, files, audit, auth, diagnostics).
- **Containerization**:
  - **Dockerfile** (multi‑stage build) to build and run the Next.js app.
  - **docker-compose** to orchestrate `app` (Next.js) and `db` (PostgreSQL) services.

### Data Access Layer

- **ORM**: **Prisma** (`@prisma/client`)
  - Schema defined in `prisma/schema.prisma` (PostgreSQL datasource).
  - Migrations maintained in `prisma/migrations/*`.
  - Models in active use include:
    - `User`, `Account`, `Session`, `VerificationToken`
    - `News` (department announcements)
    - `File` (file/picture metadata)
    - `AuditLog` (action logging)
    - `SystemSetting` (global settings/announcements)

### Database

- **Local & Docker environment**:
  - **Database engine**: **PostgreSQL**
  - Managed via `docker-compose` service `jscms-db`.
  - Connection string provided by `DATABASE_URL` (Postgres URI) in `.env`.
  - Prisma migrations applied on container startup by `docker-entrypoint.sh` using `npx prisma migrate deploy`.

- **Production (intended)**:
  - **PostgreSQL** (e.g., **Vercel Postgres** or another managed Postgres instance).
  - Same Prisma schema (`provider = "postgresql"`) and migration workflow (`npx prisma migrate deploy`).

### Storage for Pictures & Files

- Images/files uploaded through the UI are:
  - Stored as **metadata records** in the Prisma `File` model (name, size, type, department, preview URL, uploader email).
  - Image previews are currently handled via **data URLs (base64)** stored in `previewUrl` / `imageUrl` fields for demo purposes.
  - No external object storage (S3, etc.) is wired in yet; this can be introduced later for production‑grade file hosting.

### Infrastructure Summary

- **Core stack**: **Next.js + React + Tailwind CSS + Prisma + PostgreSQL + Docker**
- **Auth**: **Google OAuth 2.0 + JWT sessions**
- **Runtime**: Node.js app container (`app`) + PostgreSQL DB container (`db`) orchestrated by `docker-compose`.

