import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Boot database connection before accepting requests
connectDB();

// Allow cross-origin requests (frontend on different domain/port)
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// Root endpoint — useful for quick sanity checks on deployment
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Less Task Backend API is running live',
    health: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Health check used by Render to verify the service is alive
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Task Gimi API',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`[Server] Task Gimi Express Server running on port ${PORT}`);
});
