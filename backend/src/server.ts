import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import apiRoutes from './routes/api';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// API Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));
app.use('/api', apiRoutes);
// Fallback for cases where Vercel might pass the path without the /api prefix or twice
app.use('/', apiRoutes);

// Export app for serverless / testing
export default app;

// Only start the server if not running in a serverless environment
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Backend is running on http://localhost:${PORT}`);
    });
}
