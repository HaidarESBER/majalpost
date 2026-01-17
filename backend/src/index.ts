import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  });
});

// Start server
async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
