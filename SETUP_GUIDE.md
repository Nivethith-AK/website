# Fashion Talent Agency Platform - Complete Setup Guide

## 🚀 Project Overview

**Aura Model** is a professional, scalable SaaS platform for managing fashion designer hiring. It connects designers, companies, and admins in a seamless ecosystem.

### Tech Stack
- **Frontend**: Next.js 16.2.3 + React 19 + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: MongoDB
- **Authentication**: JWT-based auth with bcrypt

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (local or cloud instance)
- npm or yarn

### 1. Backend Setup

```bash
# Install dependencies
npm install

# Create .env file with the following variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fashion_talent_agency
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
PORT=5000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
FRONTEND_URL=http://localhost:3000

# Start backend server
npm run backend:dev
```

### 2. Frontend Setup

```bash
# Dependencies are already installed
# Start the frontend development server
npm run dev

# Frontend will be available at: http://localhost:3000
# Backend will be available at: http://localhost:5000
```

### Running Both Simultaneously
```bash
npm run dev  # Uses concurrently to run both frontend and backend
```

---

## 🗂️ Project Structure

```
.
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── User.js             # Base user model
│   │   ├── Designer.js         # Designer profile
│   │   ├── Company.js          # Company profile
│   │   ├── ClientRequest.js    # Project requests
│   │   └── Project.js          # Project assignments
│   ├── controllers/
│   │   ├── authController.js   # Auth logic
│   │   ├── designerController.js
│   │   ├── adminController.js
│   │   └── clientController.js
│   ├── middleware/
│   │   └── auth.js             # JWT & RBAC
│   ├── routes/
│   │   ├── auth.js
│   │   ├── designer.js
│   │   ├── admin.js
│   │   └── client.js
│   ├── uploads/                # User file uploads
│   └── server.js               # Entry point
│
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx        # Home
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   └── designers/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── designer/
│   │   │   └── dashboard/
│   │   ├── admin/
│   │   │   └── dashboard/
│   │   ├── client/
│   │   │   └── dashboard/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Navbar.tsx
│   │   └── Providers.tsx
│   └── lib/
│       └── api.ts              # API utilities
```

---

## 🔑 Key Features

### ✨ Admin Dashboard
- View all registered designers
- Approve/reject designer profiles
- Manage company/client requests
- Assign designers to projects
- Track project status (Pending → Active → Completed)
- Dashboard analytics

### 👨‍🎨 Designer Dashboard
- Create and manage profile
- Upload profile image and portfolio
- Manage skills and experience level
- Set availability status
- View assigned projects
- Profile approval status tracking

### 🏢 Company Dashboard
- Browse approved designer profiles
- Filter by skills and experience
- Submit project requests
- Track request status
- View assigned designers
- Manage company profile

### 🛡️ Admin Features
- Role-based access control (RBAC)
- Approve/reject designers
- Manage all requests and projects
- View platform analytics
- Assign designers to projects

---

## 🔐 API Endpoints

### Authentication
```
POST   /api/auth/register/designer    # Designer signup
POST   /api/auth/register/company     # Company signup
POST   /api/auth/login                # Login
GET    /api/auth/me                   # Get current user
POST   /api/auth/logout               # Logout
```

### Designers
```
GET    /api/designers                 # Get all approved designers
GET    /api/designers/:id             # Get designer profile
GET    /api/designers/profile/me      # Get own profile (protected)
PUT    /api/designers/profile/me      # Update profile (protected)
POST   /api/designers/upload/profile-image
POST   /api/designers/upload/portfolio
```

### Admin
```
GET    /api/admin/dashboard/stats     # Dashboard statistics
GET    /api/admin/designers/pending   # Pending approvals
PUT    /api/admin/designers/:id/approve
PUT    /api/admin/designers/:id/reject
GET    /api/admin/requests            # All requests
PUT    /api/admin/requests/:id/approve
PUT    /api/admin/requests/:id/reject
POST   /api/admin/projects/assign     # Assign designers
GET    /api/admin/projects            # All projects
PUT    /api/admin/projects/:id/status
```

### Clients/Companies
```
POST   /api/clients/requests          # Create project request
GET    /api/clients/requests          # Get own requests
PUT    /api/clients/requests/:id      # Update request
DELETE /api/clients/requests/:id      # Delete request
GET    /api/clients/profile
PUT    /api/clients/profile           # Update company info
```

---

## 🎨 Color Scheme

The platform uses a premium, minimal color palette:

```css
--background: #ffffff (light) / #09090b (dark)
--foreground: #111111 (light) / #fafafa (dark)
--accent: #E8D39E (gold) / #d4af37 (dark)
--accent-purple: #BBA9F5 (light purple)
--muted: #f4f4f5 (light) / #27272a (dark)
--border: #e4e4e7 (light) / #27272a (dark)
```

---

## 📝 User Roles & Permissions

### Designer
- View own profile
- Update personal information
- Upload portfolio
- View assigned projects
- Cannot access admin features

### Company/Client
- Browse designer profiles
- Filter by skills and experience
- Submit project requests
- View request status
- Cannot approve/reject designers

### Admin
- Full system access
- Approve/reject designers
- Manage all requests
- Assign designers to projects
- View analytics
- Delete/modify any content

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel
vercel deploy
```

### Backend (Heroku / Railway / Render)
```bash
# Push to repository
git push heroku main

# Or configure for Render/Railway
```

### Environment Variables for Production
```
MONGODB_URI=mongodb+srv://prod_user:prod_password@prod_cluster.mongodb.net/fashion_talent_agency
JWT_SECRET=your_production_secret_key
JWT_EXPIRE=7d
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGINS=https://your-frontend-domain.com
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=your-gmail-address@gmail.com

# Frontend (Vercel)
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
NEXTAUTH_URL=https://your-frontend-domain.com
NEXTAUTH_SECRET=your_nextauth_secret
```

Use `.env.example` for a complete copy-paste template.

---

## 📱 Features to Implement

### Phase 2 (Upcoming)
- [ ] Messaging/chat system between designers and clients
- [ ] Video profile uploads
- [ ] Contract management
- [ ] Payment integration (Stripe)
- [ ] Subscription plans
- [ ] AI-based designer matching
- [ ] Email notifications
- [ ] Admin analytics dashboard

### Phase 3 (Future)
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (WebSockets)
- [ ] Video interviews
- [ ] Portfolio review system
- [ ] Designer ratings and reviews

---

## 🧪 Testing

### Backend Testing
```bash
# Create test files in backend/tests/
npm test
```

### Frontend Testing
```bash
npm run test
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check connection string in .env
# Ensure MongoDB is running locally or accessible from cloud
# Verify IP whitelist in MongoDB Atlas
```

### JWT Authentication Errors
```bash
# Clear localStorage and login again
# Check JWT secret matches between .env and actual usage
```

### CORS Issues
```bash
# Verify CORS settings in backend server.js
# Check allowed origins match frontend URL
```

---

## 📞 Support

For issues or questions:
- Check the GitHub issues
- Review API documentation
- Test with Postman/Insomnia

---

## 📄 License

This project is proprietary and confidential.

---

## 🎯 Next Steps

1. **Set up MongoDB**: Create a cluster and get connection string
2. **Configure environment variables**: Update `.env` file
3. **Run backend server**: `npm run backend:dev`
4. **Run frontend**: `npm run dev` (in another terminal)
5. **Create test data**: Use signup and login
6. **Test all features**: Navigate through dashboards

---

## 🌟 Key Highlights

✅ Professional startup-level design
✅ Scalable MongoDB + Express architecture
✅ JWT-based secure authentication
✅ Role-based access control
✅ Responsive mobile-friendly UI
✅ Clean, maintainable code
✅ Ready for production deployment

---

**Built with ❤️ for the fashion industry**
