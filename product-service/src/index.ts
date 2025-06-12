import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import config from './config';
import productRoutes from './modules/product/product.routes';
import rabbitmq from './common/services/rabbitmq';
import productService from './modules/product/product.service';
import { errorHandler } from './common/middlewares/error.middleware';
import logger from './common/utils/logger';

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
      title: 'Product Service API',
      version: '1.0.0',
      description: 'Product Management API',
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
app.use('/api/products', productRoutes);

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

// Connect to RabbitMQ and set up event handlers
rabbitmq
  .connect()
  .then(async () => {
    logger.info('Connected to RabbitMQ');

    // Subscribe to user.deleted event
    await rabbitmq.subscribe('user.deleted', async (data: { id: string }) => {
      logger.info(`Received user.deleted event for user: ${data.id}`);
      await productService.handleUserDeleted(data.id);
    });
  })
  .catch((error) => {
    logger.error('RabbitMQ connection error:', error);
    process.exit(1);
  });

// Start server
const server = app.listen(config.server.port, () => {
  logger.info(`Product service listening on port ${config.server.port}`);
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