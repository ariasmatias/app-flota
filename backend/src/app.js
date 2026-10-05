import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import healthRoutes from './routes/health.routes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(helmet());
app.use(cors({
  origin: env.environment === 'development' ? 'http://localhost:5173' : false,
}));
app.use(express.json());
app.use('/api/health', healthRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
