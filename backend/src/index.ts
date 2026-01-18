import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import passport, { configurePassport } from './config/passport';
import { getSessionConfig } from './config/session';
import { initializeDatabase } from './config/database';
import { loadAllItemData } from './services/itemLoader';
import authRoutes from './routes/auth';
import weaponsRoutes from './routes/weapons';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Session configuration
app.use(session(getSessionConfig()));

// Initialize Passport
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/player/weapons', weaponsRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'CS2 WeaponPaints API is running' });
});

// Initialize application
async function initializeApp() {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Load item data
    await loadAllItemData();

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Start the application
initializeApp();

export default app;
