# Majal Post (مجال بوست)

Majal Post is a digital news and media platform focused on Lebanese social, economic, and environmental issues. The site is Arabic-first with a right-to-left (RTL) interface and organizes coverage into themed categories such as Environment & Climate, Society, Economy, Education, Technology, and Health. It is built as a monorepo with a Next.js frontend, an Express/MongoDB REST API backend, and a shared TypeScript types package, and includes a full admin dashboard, article and category management, a tag system, media uploads, comments, and a contributor-application workflow.

## Tech Stack

### Frontend
- **Next.js 16** (App Router) with **React 19**
- **TypeScript**
- **Tailwind CSS 4** (via `@tailwindcss/postcss`)
- ESLint (`eslint-config-next`)

### Backend
- **Node.js** with **Express 5** (ESM, `type: module`)
- **TypeScript**, run in dev with **tsx**
- **MongoDB** via **Mongoose**
- **JWT** authentication (`jsonwebtoken`) and password hashing with **bcrypt**
- **Cloudinary** + **Multer** + **Sharp** for image upload, storage, and processing
- **Nodemailer** for transactional email (SMTP)
- Security & hardening: **Helmet**, **CORS**, **express-rate-limit**, and HTML sanitization with **DOMPurify** + **jsdom**

### Shared
- `@majalpost/shared` — a private package of TypeScript types shared between frontend and backend.

## Features

- Arabic (RTL) news site organized into themed content categories and sub-categories
- Article publishing with slugs, tags, and categories
- Tag system for cross-navigation
- Full-text / article search
- User authentication (register, login) with JWT and role-based access
- Admin dashboard for managing articles, categories, tags, users, media, and contributor applications
- Contributor workflow: public "become a contributor" application and per-author "my articles" authoring pages
- Comments on articles
- Media library with image upload (Cloudinary), resizing (Sharp), and thumbnails
- Email notifications via SMTP (registration, contributor applications); silently skipped when SMTP is not configured
- Health check endpoint reporting API and database status

## Project Structure

```
majalpost/
├── backend/                # Express + MongoDB REST API (TypeScript, ESM)
│   ├── src/
│   │   ├── config/         # env loading/validation, DB connection
│   │   ├── middleware/     # auth, error handling, etc.
│   │   ├── models/         # Mongoose models (Article, Category, Comment,
│   │   │                   #   ContributorApplication, Media, Tag, User)
│   │   ├── routes/         # API routes (auth, articles, categories, tags,
│   │   │                   #   comments, media, search, users, ...)
│   │   ├── scripts/        # seed & admin utility scripts
│   │   ├── types/          # backend-local types
│   │   └── utils/          # helpers
│   └── .env.example
├── frontend/               # Next.js 16 App Router site (React 19, Tailwind 4)
│   └── src/
│       ├── app/            # routes: /, /article, /category, /search, /about,
│       │                   #   /contact, /login, /register, /profile,
│       │                   #   /my-articles, /become-contributor, /admin/*
│       ├── components/      # UI + admin components
│       ├── contexts/        # React contexts (e.g. auth)
│       └── lib/             # API client & utilities
├── shared/                 # @majalpost/shared — shared TypeScript types
└── docker-compose.yml      # MongoDB service for local development
```

## Getting Started

### Prerequisites
- Node.js v18 or higher
- MongoDB (local install, Docker, or MongoDB Atlas)
- npm

### 1. Start MongoDB (Docker option)

A `docker-compose.yml` is provided that runs MongoDB 7 on `localhost:27017` with a persistent volume:

```bash
docker-compose up -d
```

You can alternatively use a local MongoDB installation or a MongoDB Atlas connection string.

### 2. Backend

```bash
cd backend
npm install
# create backend/.env (see Environment Variables below)
npm run dev
```

The backend runs on `http://localhost:5000`, with the API mounted under `/api` (health check at `http://localhost:5000/api/health`).

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`. By default the API client points at `http://localhost:5000/api`; override it by creating `frontend/.env.local` with `NEXT_PUBLIC_API_URL`.

### Useful backend scripts

- `npm run dev` — start dev server with hot reload (tsx watch)
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run the compiled server (requires `build` first)
- `npm run lint` — run ESLint
- `npm run seed:categories` — seed categories
- `npm run seed:articles` — seed articles
- `npm run create-admin` — create an admin user (uses `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`)
- `npm run set-admin` — promote an existing user to admin

## Environment Variables

### Backend (`backend/.env`)

Minimal development set (from `.env.example` / README-RUNNING.md):

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/majalpost
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here-change-in-production
```

Full set recognized by `backend/src/config/env.ts` (most are optional with defaults; only `MONGODB_URI` is strictly required):

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | Backend port | `5000` |
| `MONGODB_URI` | MongoDB connection string (required) | — |
| `NODE_ENV` | `development` \| `production` \| `test` | `development` |
| `FRONTEND_URL` | Allowed frontend origin (CORS) | `http://localhost:3000` |
| `JWT_SECRET` | JWT signing secret (required in production, ≥ 32 chars) | dev fallback |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `UPLOAD_DIR` | Local upload directory | `./uploads` |
| `THUMBNAIL_DIR` | Thumbnail directory | `./uploads/thumbnails` |
| `MAX_FILE_SIZE` | Max upload size in bytes | `10485760` (10 MB) |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | — |
| `SMTP_PASS` | SMTP password / app password | — |
| `SMTP_FROM_EMAIL` | From address | `SMTP_USER` or `noreply@majalpost.com` |
| `SMTP_FROM_NAME` | From display name | `مجال بوست` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | — |
| `CLOUDINARY_API_KEY` | Cloudinary API key | — |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | — |

Admin-creation scripts also read `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME`.

Email is optional: if `SMTP_USER` / `SMTP_PASS` are not set, outgoing emails are silently skipped and the rest of the app continues to work. See `EMAIL_SETUP.md` for Gmail / SendGrid / Mailgun setup.

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Notes

This repository contains a number of task-specific debugging and deployment documents. The most useful starting points:

- **`README-RUNNING.md`** — detailed local run instructions and troubleshooting (MongoDB, CORS, health checks).
- **`EMAIL_SETUP.md`** — configuring SMTP email (Gmail / SendGrid / Mailgun).
- **`VERCEL_DEPLOYMENT_GUIDE.md`** and `VERCEL_ENV_SETUP.md` — deploying the frontend to Vercel.
- **`MINIMAL_DEPLOYMENT_GUIDE.md`**, `RAILWAY_FIX.md`, `RAILWAY_TROUBLESHOOTING.md` — backend deployment (Railway).
- `SECURITY_VULNERABILITIES_REPORT.md` / `SECURITY_FIXES_APPLIED.md` — security review notes.
- `desc.md` — the original product brief (site structure, categories, and visual identity).

Other `*.md` files in the root (`CORS_FIX*.md`, `DEBUG_405_ERROR.md`, `EMAIL_*.md`, `ISSUES_FOUND*.md`, `FIXES_APPLIED_SUMMARY.md`, `SYSTEMATIC_DEBUG.md`, `GITHUB_*.md`) are historical debugging/troubleshooting logs.


---

## 👤 Author

**Built by [Haidar Esber](https://haidaresber.github.io)** — Lebanese software & web developer based in France.

[Portfolio](https://haidaresber.github.io) · [GitHub](https://github.com/HaidarESBER) · [LinkedIn](https://www.linkedin.com/in/haidaresber)
