# JS Bank CMS Portal

A secure, internal Content Management System for JS Bank built with Next.js, Prisma, and Google OAuth.

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your configuration values.

3. **Set up the database:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## 📦 Deployment to Vercel

### Prerequisites

1. **Database Setup:**
   - Vercel doesn't support SQLite (read-only filesystem)
   - Use **Vercel Postgres** (recommended) or any PostgreSQL database
   - Go to your Vercel project → Storage → Create Database → Postgres

2. **Google OAuth Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`

### Deployment Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Environment Variables in Vercel:**
   Go to Project Settings → Environment Variables and add:
   
   ```
   DATABASE_URL=postgresql://... (from Vercel Postgres)
   JWT_SECRET=your-strong-random-secret
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/api/auth/callback/google
   NODE_ENV=production
   ```

4. **Update Prisma Schema for PostgreSQL:**
   If using PostgreSQL, update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
   Then run migrations:
   ```bash
   npx prisma migrate deploy
   ```

5. **Deploy:**
   - Vercel will automatically build and deploy
   - The build process will run `prisma generate` automatically

### Post-Deployment

1. **Run database migrations:**
   ```bash
   npx prisma migrate deploy
   ```
   Or use Vercel's CLI:
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

2. **Verify Google OAuth:**
   - Ensure redirect URI matches exactly in Google Cloud Console
   - Test sign-in flow

## 🔑 Environment Variables

See `.env.example` for all required environment variables.

### Required Variables:
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Optional Variables:
- `GOOGLE_REDIRECT_URI` - Auto-detected if not set
- `NODE_ENV` - Set to `production` in Vercel

## 🗄️ Database

### Local Development (SQLite)
- Database file: `prisma/dev.db`
- Automatically created on first migration
- No additional setup required

### Production (PostgreSQL)
- Use Vercel Postgres or external PostgreSQL provider
- Update `prisma/schema.prisma` datasource to `postgresql`
- Run migrations: `npx prisma migrate deploy`

## 🛠️ Features

- **Google OAuth Authentication** - Secure sign-in with Google accounts
- **Role-Based Access Control** - Admin, Editor, and Viewer roles
- **News Management** - Create and manage department announcements
- **File Library** - Upload and manage files
- **Audit Logging** - Track all user actions
- **Admin Panel** - User management and system settings

## 📂 Project Structure

```
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── actions/          # Server actions
│   └── lib/              # Utilities (auth, db)
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

## 🔒 Security

- JWT tokens stored in HTTP-only cookies
- Role-based access control
- Secure session management
- Google OAuth token verification

## 📝 License

Private - JS Bank Internal Use Only
