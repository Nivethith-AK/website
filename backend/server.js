import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import { ensureAdminUser } from './config/adminSeed.js';

// Routes
import authRoutes from './routes/auth.js';
import designerRoutes from './routes/designer.js';
import adminRoutes from './routes/admin.js';
import clientRoutes from './routes/client.js';
import platformAuthRoutes from './routes/platformAuth.js';
import platformDesignersRoutes from './routes/platformDesigners.js';
import platformRequestRoutes from './routes/platformRequest.js';
import platformAdminRoutes from './routes/platformAdmin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com' 
      : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
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

// Canonical platform routes requested for clean architecture
app.use('/api/auth', platformAuthRoutes);
app.use('/api/designers', platformDesignersRoutes);
app.use('/api/request', platformRequestRoutes);
app.use('/api/admin', platformAdminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await ensureAdminUser();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
