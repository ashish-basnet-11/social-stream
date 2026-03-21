# Social Stream

A full-stack, real-time social media web application built with the PERN/MERN stack (Express, React, Node.js) featuring Prisma ORM and Socket.IO for live interactions. 

![Project Banner](https://via.placeholder.com/1000x400?text=Social+Stream+Preview) <!-- Replace with an actual screenshot of your app -->

## ✨ Features

- **Authentication & Security:** 
  - JWT-based authentication
  - Google OAuth 2.0 integration (Passport.js)
  - OTP Email verification for new accounts
- **Social Graph:** 
  - Send, accept, and manage friend requests
  - View user profiles and feeds
- **Engagement:** 
  - Create posts with image uploads (Cloudinary integration)
  - Like, unlike, and comment on posts
- **Real-Time Capabilities (Socket.IO):**
  - Live instant messaging between friends
  - Real-time notifications for likes, comments, and friend requests
- **Modern UI/UX:** 
  - Fully responsive design built with Tailwind CSS v4
  - Interactive elements and clean interface layout (Lucide React icons)

## 🛠️ Tech Stack

### Frontend
- **React 19** (Vite)
- **Tailwind CSS v4** for styling
- **React Router DOM** for navigation
- **Socket.io-client** for real-time web sockets
- **Axios** for API requests
- **Lucide React** for icons
- **React Dropzone** for file uploads

### Backend
- **Node.js** & **Express**
- **Prisma ORM** (Configured for Neon Postgres)
- **Socket.IO** for WebSocket implementation
- **Passport.js** for Google OAuth 
- **Cloudinary** for scalable image storage
- **Nodemailer** for transactional emails
- **Zod** for schema validation

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18+ recommended)
- A Neon Postgres Database (or MySQL/Postgres instance)
- Cloudinary Account
- Google Cloud Console Project (for OAuth)

### 1. Clone the repository
```bash
git clone https://github.com/ashish-basnet-11/social-stream.git
cd social-stream
```

### 2. Install dependencies
Install dependencies for both the frontend and backend:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Variables
You will need to create a `.env` file in both the `backend` and `frontend` directories.

**Backend (`backend/.env`):**
```env
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL="postgresql://user:password@hostname/dbname?sslmode=require"

# Auth Secrets
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# Email Service
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5001/api
```

### 4. Database Setup
Push the Prisma schema to your database to create the necessary tables:
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 5. Running the Application
You'll need two terminal windows to run both servers simultaneously.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The application should now be running on `http://localhost:5173`.

## 📜 License
This project is licensed under the ISC License.
