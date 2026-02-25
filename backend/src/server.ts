import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import apiRoutes from './routes/api';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use('/api', apiRoutes);

// Export app for serverless / testing
export default app;

// Only start the server if not running in a serverless environment
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Backend is running on http://localhost:${PORT}`);
    });
}
startServer().catch(err => {
    console.error('Failed to start server:', err);
});
