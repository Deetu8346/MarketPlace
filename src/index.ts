import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

import marketplaceRoutes from './routes/marketplace';

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Access-Key']
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS as string) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS as string) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req: Request, res: Response, next: NextFunction): void => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

app.use('/api/v1/marketplace', marketplaceRoutes);

app.get('/', (req: Request, res: Response): void => {
  res.json({
    message: 'Marketplace API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      products: 'GET /api/v1/marketplace/products?vendor=<ecom|voucher>',
      inventory: 'POST /api/v1/marketplace/validate-inventory',
      order: 'POST /api/v1/marketplace/order?vendor=<ecom|voucher>',
      vendors: 'GET /api/v1/marketplace/vendors',
      health: 'GET /api/v1/marketplace/health'
    }
  });
});

app.use('*', (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

interface ErrorWithStatus extends Error {
  status?: number;
}

app.use((error: ErrorWithStatus, req: Request, res: Response, next: NextFunction): void => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

process.on('SIGTERM', (): void => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', (): void => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, (): void => {
  console.log(`
🚀 Marketplace API Server started successfully!

 Server Information:
   - Port: ${PORT}
   - Environment: ${process.env.NODE_ENV || 'development'}
   - Process ID: ${process.pid}
   - Node Version: ${process.version}

 API Endpoints:
   - Base URL: http://localhost:${PORT}
   - Products: GET /api/v1/marketplace/products?vendor=<ecom|voucher>
   - Inventory: POST /api/v1/marketplace/validate-inventory
   - Orders: POST /api/v1/marketplace/order?vendor=<ecom|voucher>
   - Vendors: GET /api/v1/marketplace/vendors
   - Health: GET /api/v1/marketplace/health

 Documentation:
   - Root: GET /
   - Supported Vendors: ecom, voucher

 Started at: ${new Date().toISOString()}
  `);
});

export default app;