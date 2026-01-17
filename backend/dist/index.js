import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
const app = express();
const PORT = process.env.PORT || 5000;
// Security middleware
app.use(helmet());
// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'ok',
            timestamp: new Date().toISOString()
        }
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
export default app;
//# sourceMappingURL=index.js.map