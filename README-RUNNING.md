# How to Run Majal Post

This guide explains how to run both the frontend and backend servers for development.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB database (local, Docker, or Atlas)
- npm or yarn
- Docker Desktop (optional, for Docker setup)

## MongoDB Setup

You have three options to run MongoDB:

### Option 1: Docker (Recommended for Development)

1. **Start MongoDB using Docker Compose:**
   ```bash
   docker-compose up -d
   ```
   
   This will start MongoDB on `localhost:27017`. The database will persist in a Docker volume.

2. **Stop MongoDB:**
   ```bash
   docker-compose down
   ```

3. **View MongoDB logs:**
   ```bash
   docker-compose logs -f mongodb
   ```

### Option 2: Local MongoDB Installation

1. **Install MongoDB Community Edition:**
   - Download from: https://www.mongodb.com/try/download/community
   - Follow installation instructions for Windows

2. **Start MongoDB service:**
   ```powershell
   # Start MongoDB as a Windows service
   net start MongoDB
   
   # Or if MongoDB is installed but not as a service, run:
   mongod --dbpath "C:\data\db"
   ```

### Option 3: MongoDB Atlas (Cloud)

1. **Create a free account:** https://www.mongodb.com/cloud/atlas
2. **Create a cluster and get your connection string**
3. **Update your `.env` file with the Atlas connection string:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/majalpost
   ```

## Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Create a `.env` file in the `backend/` directory:**
   Create `backend/.env` with the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/majalpost
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your-secret-key-here-change-in-production
   ```
   
   **Note:** 
   - For Docker/local MongoDB: Use `mongodb://localhost:27017/majalpost`
   - For MongoDB Atlas: Use your Atlas connection string

4. **Make sure MongoDB is running** (see MongoDB Setup above)

5. **Start the backend server:**
   ```bash
   npm run dev
   ```
   
   The backend will start on `http://localhost:5000`

## Frontend Setup

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Create a `.env.local` file in the `frontend/` directory (optional):**
   The API client will default to `http://localhost:5000/api`, but you can create `frontend/.env.local` to override:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will start on `http://localhost:3000`

## Running Both Servers

You need to run MongoDB and both servers:

1. **Terminal 1 - MongoDB (if using Docker):**
   ```bash
   docker-compose up -d
   ```

2. **Terminal 2 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Terminal 3 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` to see the site.

## Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload (tsx watch)
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server (requires build first)
- `npm run lint` - Run ESLint

### Frontend
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm start` - Start production server (requires build first)
- `npm run lint` - Run ESLint

## Troubleshooting

### Backend won't start
- Check that MongoDB is running (if using local MongoDB)
- Verify your `.env` file exists and has correct values
- Check that port 5000 is not already in use

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify `NEXT_PUBLIC_API_URL` in `.env.local` matches backend URL

### MongoDB Connection Issues

**Error: `connect ECONNREFUSED ::1:27017` or `connect ECONNREFUSED 127.0.0.1:27017`**

This means MongoDB is not running. Solutions:

1. **If using Docker:**
   ```bash
   docker-compose up -d
   # Check if it's running
   docker ps
   ```

2. **If using local MongoDB:**
   - Check if MongoDB service is running:
     ```powershell
     Get-Service MongoDB
     ```
   - Start MongoDB service:
     ```powershell
     net start MongoDB
     ```

3. **If using MongoDB Atlas:**
   - Verify your connection string is correct
   - Check network access settings in Atlas (add your IP address)
   - Ensure username/password are correct

4. **Verify MongoDB is accessible:**
   ```powershell
   Test-NetConnection -ComputerName localhost -Port 27017
   ```

5. **Check your `.env` file:**
   - Verify `MONGODB_URI` is set correctly
   - For local: `mongodb://localhost:27017/majalpost`
   - For Atlas: Your full connection string from Atlas dashboard

## Health Check

Once both servers are running, you can verify the connection:

1. Backend health: `http://localhost:5000/api/health`
2. Frontend: `http://localhost:3000` (should show API connection test if backend is running)

