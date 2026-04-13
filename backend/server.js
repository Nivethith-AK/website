import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import connectDB from './config/database.js';
import { ensureAdminUser } from './config/adminSeed.js';
import { initSocket } from './socket.js';
import { isAllowedOrigin } from './config/origins.js';

// Routes
import authRoutes from './routes/auth.js';
import designerRoutes from './routes/designer.js';
import adminRoutes from './routes/admin.js';
import clientRoutes from './routes/client.js';
import messageRoutes from './routes/messages.js';
import profileRoutes from './routes/profile.js';
import jobRoutes from './routes/jobs.js';
import projectChatRoutes from './routes/projectChats.js';

dotenv.config();

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin ${origin}`));
    },
    credentials: true,
  })
);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/designers', designerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/project-chats', projectChatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  void next;
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const db = await connectDB();
    if (!db && process.env.NODE_ENV === 'production') {
      throw new Error('MongoDB connection is required in production');
    }

    await ensureAdminUser();
    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    httpServer.on('error', (error) => {
      console.error('HTTP server error:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
