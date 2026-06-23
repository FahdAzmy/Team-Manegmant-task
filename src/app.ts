import express, { Application } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger/swagger';
import routes from './routes';
import { ApiError } from './utils/ApiError';
import { errorHandler } from './middleware/error.middleware';

const app: Application = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation UI Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount application API routes
app.use('/api', routes);

// 404 Route handler
app.use((req, res, next) => {
  next(ApiError.notFound('Resource not found'));
});

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
