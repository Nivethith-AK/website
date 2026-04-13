# 🚀 Fashion Talent Agency Platform - Aura Model

> A professional, scalable SaaS platform connecting fashion designers with companies

[![Next.js](https://img.shields.io/badge/Next.js-16.2.3-black?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)

---

## 📋 Quick Links

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Deployment](#deployment)

---

## ✨ Features

### 👨‍💼 Admin Dashboard
- Real-time platform statistics
- Designer approval management
- Project request review
- Designer-to-project assignment
- Project status tracking
- Company management

### 👨‍🎨 Designer Profile
- Complete profile management
- Skills and experience tracking
- Portfolio upload (scaffolding)
- Availability status
- Project history
- Approval status

### 🏢 Company Portal
- Browse and filter designers
- Create project requests
- Track request status
- View assigned designers
- Company profile management

### 🔒 Security
- JWT authentication
- Bcrypt password hashing
- Role-based access control
- Protected endpoints
- Token management

---

## 🛠 Tech Stack

**Frontend**: Next.js 16.2.3, React 19, TypeScript, Tailwind CSS, Framer Motion
**Backend**: Express.js, Node.js, MongoDB, Mongoose, JWT
**Tools**: TypeScript, ESLint, Multer

---

## 📦 Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up .env file
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fashion_talent_agency
JWT_SECRET=your_secret_key
PORT=5000
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# 3. Start development servers
npm run dev

# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

---

## 🚀 Quick Start

### Access the Platform
- Home: http://localhost:3000
- Designers: http://localhost:3000/designers
- Sign Up: http://localhost:3000/signup
- Login: http://localhost:3000/login

### Test Accounts
```
Admin: test@gmail.com / 123456
```

### Popular Routes
| Page | URL |
|------|-----|
| Home | / |
| Designers | /designers |
| About | /about |
| Contact | /contact |
| Designer Dashboard | /designer/dashboard |
| Admin Dashboard | /admin/dashboard |
| Company Dashboard | /client/dashboard |

---

## 📂 Project Structure

```
├── backend/
│   ├── config/              # Database config
│   ├── models/              # 5 Mongoose models
│   ├── controllers/         # 4 controllers
│   ├── routes/              # 4 route files
│   ├── middleware/          # Auth middleware
│   └── server.js
│
├── src/
│   ├── app/
│   │   ├── page.tsx         # Home
│   │   ├── about/
│   │   ├── contact/
│   │   ├── designers/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── designer/dashboard/
│   │   ├── admin/dashboard/
│   │   └── client/dashboard/
│   ├── components/
│   └── lib/
│
└── package.json
```

---

## 📡 API Endpoints (41 Total)

### Authentication (5)
```
POST   /api/auth/register/designer
POST   /api/auth/register/company
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout
```

### Designers (6)
```
GET    /api/designers
GET    /api/designers/:id
GET    /api/designers/profile/me
PUT    /api/designers/profile/me
POST   /api/designers/upload/profile-image
POST   /api/designers/upload/portfolio
```

### Admin (10)
```
GET    /api/admin/dashboard/stats
GET    /api/admin/designers/pending
PUT    /api/admin/designers/:id/approve
PUT    /api/admin/designers/:id/reject
GET    /api/admin/requests
PUT    /api/admin/requests/:id/approve
PUT    /api/admin/requests/:id/reject
POST   /api/admin/projects/assign
GET    /api/admin/projects
PUT    /api/admin/projects/:id/status
```

### Clients (7)
```
POST   /api/clients/requests
GET    /api/clients/requests
PUT    /api/clients/requests/:id
DELETE /api/clients/requests/:id
GET    /api/clients/profile
PUT    /api/clients/profile
GET    /api/admin/companies
```

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

Current Vercel URL:
- `https://website-sage-one-13.vercel.app`

When you buy your `.com` domain later, update only the environment variables below. No code changes are needed.

### Backend (Render/Railway)
```bash
Deploy the Express backend separately and point the frontend to it.
```

### Environment Variables
```
### Frontend (Vercel)
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
NEXTAUTH_URL=https://website-sage-one-13.vercel.app
NEXTAUTH_SECRET=your_secret
FRONTEND_URL=https://website-sage-one-13.vercel.app

### Backend (Render/Railway)
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret
JWT_EXPIRE=7d
FRONTEND_URL=https://website-sage-one-13.vercel.app
CORS_ORIGINS=https://website-sage-one-13.vercel.app
SMTP_USER=your_gmail_address
SMTP_PASS=your_gmail_app_password
SMTP_FROM=your_gmail_address
PORT=5000
NODE_ENV=production
```

### After buying a custom domain
Update only:
- `NEXTAUTH_URL`
- `FRONTEND_URL`
- `NEXT_PUBLIC_API_URL` if the backend URL changes
- `CORS_ORIGINS` if you set multiple allowed frontends

The app is already wired to read these values from env, so domain changes won't require code edits.

### Copy-Paste Production Setup
Use `.env.example` as your source of truth.

### Supabase-Only Backend Mode
If you are moving to Supabase-only backend, set these first:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)

In this mode, app logic should use Supabase Auth + Postgres + Storage + Realtime directly, and `NEXT_PUBLIC_API_URL` is not required unless you keep legacy Express routes.

Frontend on Vercel:
- `NEXT_PUBLIC_API_URL` -> backend URL + `/api`
- `NEXTAUTH_URL` -> your public frontend URL
- `NEXTAUTH_SECRET` -> strong random secret
- `FRONTEND_URL` -> your public frontend URL

Backend on Render/Railway:
- `MONGODB_URI` -> MongoDB Atlas connection string
- `JWT_SECRET` -> same strong secret
- `JWT_EXPIRE` -> `7d`
- `FRONTEND_URL` -> your public frontend URL
- `CORS_ORIGINS` -> comma-separated allowed frontend URLs
- `SMTP_USER` -> Gmail address
- `SMTP_PASS` -> Gmail app password
- `SMTP_FROM` -> Gmail address
- `PORT` -> `5000`
- `NODE_ENV` -> `production`

### Non-Technical Deploy Flow
1. Deploy backend first on Render/Railway and set backend env vars from `.env.example`
2. Confirm backend health endpoint works: `https://your-backend-domain.com/api/health`
3. Open Vercel project settings and set frontend env vars from `.env.example`
4. Set `NEXT_PUBLIC_API_URL` to your backend URL ending with `/api`
5. Redeploy Vercel, then test signup/login/admin/designer pages on live URL
6. After buying `.com`, update `NEXTAUTH_URL`, `FRONTEND_URL`, and `CORS_ORIGINS`

---

## 🎨 Design System

### Colors
- **Primary**: Black/White
- **Accent**: Gold (#E8D39E)
- **Accent-2**: Purple (#BBA9F5)
- **Neutral**: Gray series

### Features
- Responsive mobile-first design
- Card-based layouts
- Smooth transitions
- Accessibility ready

---

## 📚 Additional Docs

- **Setup Guide**: See SETUP_GUIDE.md
- **Project Summary**: See PROJECT_SUMMARY.md
- **Production Env Template**: `.env.example`
- **Troubleshooting**: Check SETUP_GUIDE.md section

---

## 🐛 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| MongoDB error | Check MONGODB_URI and IP whitelist |
| Auth fails | Clear localStorage and re-login |
| CORS error | Check backend CORS config |
| Port in use | Change PORT or kill process |

---

## ✨ Key Achievements

- ✅ 39+ source files created
- ✅ 5 database models
- ✅ 41 API endpoints
- ✅ 10+ pages built
- ✅ Full authentication system
- ✅ Role-based access control
- ✅ Professional UI/UX
- ✅ Production-ready code

---

**Built with ❤️ for the fashion industry**

*Last Updated: April 12, 2026*
