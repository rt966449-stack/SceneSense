import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createApiRouter } from './routes/api';
import { createAIService } from './services/externalAi';

// Load environment variables
dotenv.config();

export const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow local Vite dev server
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize AI Service
const aiService = createAIService();

// Mount Routes
app.use('/api', createApiRouter(aiService));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SceneSense API Server',
    aiProvider: aiService.providerName
  });
});

// Centralized error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[SceneSense Server Error]', err);
  res.status(500).json({
    success: false,
    error: err.message || 'An unexpected server error occurred.'
  });
});

// Start listening if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` SceneSense Backend Server Running!`);
    console.log(` Local URL: http://localhost:${PORT}`);
    console.log(` Health Check: http://localhost:${PORT}/health`);
    console.log(` AI Provider: ${aiService.providerName}`);
    console.log(`===============================================`);
  });
}
