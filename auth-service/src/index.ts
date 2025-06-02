import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import config from './config';
import logger from './common/utils/logger';
import { errorHandler } from './common/middlewares/error.middleware';
import userRoutes from './modules/user/user.routes';
import authRoutes from './modules/auth/auth.routes';
import rabbitmq from './common/services/rabbitmq';

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
}));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API',
      version: '1.0.0',
      description: 'Authentication and User Management API',
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}`,
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Error handling
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(config.mongodb.uri)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Connect to RabbitMQ
rabbitmq
  .connect()
  .then(() => {
    logger.info('Connected to RabbitMQ');
  })
  .catch((error) => {
    logger.error('RabbitMQ connection error:', error);
    process.exit(1);
  });

// Start server
const server = app.listen(config.server.port, () => {
  logger.info(`Auth service listening on port ${config.server.port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(async () => {
    await mongoose.connection.close();
    await rabbitmq.disconnect();
    logger.info('Process terminated');
    process.exit(0);
  });
});