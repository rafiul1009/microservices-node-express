import { Secret } from "jsonwebtoken";

export interface ServerConfig {
  port: number | string;
  nodeEnv: string;
}

export interface MongoDBConfig {
  uri: string;
}

export interface JWTConfig {
  accessSecret: Secret;
  refreshSecret: Secret;
  accessExpiration: string;
  refreshExpiration: string;
}

export interface RabbitMQConfig {
  url: string;
  exchange: string;
  queue: string;
}

export interface CorsConfig {
  allowedOrigins: string[];
}

export interface LoggingConfig {
  level: string;
}

export interface Config {
  server: ServerConfig;
  mongodb: MongoDBConfig;
  jwt: JWTConfig;
  rabbitmq: RabbitMQConfig;
  cors: CorsConfig;
  logging: LoggingConfig;
}