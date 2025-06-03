import dotenv from 'dotenv';
import { Secret } from 'jsonwebtoken';

// Load environment variables from .env file
dotenv.config();

interface ServerConfig {
  port: number | string;
  nodeEnv: string;
}

interface MongoDBConfig {
  uri: string;
}

interface JWTConfig {
  accessSecret: Secret;
  refreshSecret: Secret;
  accessExpiration: string;
  refreshExpiration: string;
}

interface RabbitMQConfig {
  url: string;
  exchange: string;
  queue: string;
}

interface CorsConfig {
  allowedOrigins: string[];
}

interface LoggingConfig {
  level: string;
}

interface Config {
  server: ServerConfig;
  mongodb: MongoDBConfig;
  jwt: JWTConfig;
  rabbitmq: RabbitMQConfig;
  cors: CorsConfig;
  logging: LoggingConfig;
}

const config = {
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-service',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default_access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'user_events',
    queue: process.env.RABBITMQ_QUEUE || 'auth_service_queue',
  },
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001').split(','),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'MONGODB_URI',
  'RABBITMQ_URL',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: ${envVar} environment variable is not set. Using default value.`);
  }
}

export default config;
export type { Config };