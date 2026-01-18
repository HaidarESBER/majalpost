import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs/promises';
import path from 'path';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import routes from './routes/index.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimit.js';
const app = express();
// Security middleware - configure to allow images
const frontendUrl = new URL(env.FRONTEND_URL.split(',')[0]); // Use first origin for CSP
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:", frontendUrl.origin],
        },
    },
    strictTransportSecurity: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },
}));
// HTTPS enforcement in production
if (env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        // Check if request is over HTTPS or forwarded from HTTPS (e.g., behind proxy)
        if (req.header('x-forwarded-proto') !== 'https' && req.protocol !== 'https') {
            // Redirect to HTTPS (if not behind proxy that handles this)
            // Note: In production behind a proxy (like nginx), the proxy should handle HTTPS
            // This is a safety measure
            return res.status(403).json({
                success: false,
                error: 'HTTPS required',
            });
        }
        next();
    });
}
// CORS configuration - support multiple origins
const allowedOrigins = env.FRONTEND_URL.split(',').map(url => url.trim());
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Apply general rate limiting to all API routes
app.use('/api', generalLimiter);
// API routes
app.use('/api', routes);
// 404 handler for unknown routes
app.use(notFoundHandler);
// Global error handler (must be last)
app.use(globalErrorHandler);
// Ensure upload directories exist
async function ensureUploadDirectories() {
    try {
        const uploadDir = path.join(env.UPLOAD_DIR, 'original');
        const thumbnailDir = env.THUMBNAIL_DIR;
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.mkdir(thumbnailDir, { recursive: true });
    }
    catch (error) {
        throw new Error(`Failed to create upload directories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
// Start server
async function startServer() {
    try {
        // Create upload directories
        await ensureUploadDirectories();
        // Connect to MongoDB
        await connectDB();
        // Start Express server
        app.listen(env.PORT, () => {
            if (env.NODE_ENV === 'development') {
                // Only log in development
                // eslint-disable-next-line no-console
                console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
            }
        });
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
export default app;
//# sourceMappingURL=index.js.map