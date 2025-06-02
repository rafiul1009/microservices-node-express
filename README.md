# Node.js Microservices Application

This is a microservices-based application built with Node.js, TypeScript, Express.js, MongoDB, and RabbitMQ. It consists of two main services: auth-service and product-service.

## Services

### Auth Service
- User authentication and authorization
- JWT token management (access & refresh tokens)
- User CRUD operations
- Event publishing (e.g., user.created)

### Product Service
- Product CRUD operations
- User-specific product management
- Authorization middleware for product operations

## Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Typegoose
- **Message Broker**: RabbitMQ
- **Authentication**: JWT
- **Container**: Docker

## Project Structure

```
.
├── auth-service/
│   ├── src/
│   │   ├── common/
│   │   ├── config/
│   │   ├── modules/
│   │   │   ├── user/
│   │   │   └── auth/
│   │   └── index.ts
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── product-service/
│   ├── src/
│   │   ├── common/
│   │   ├── config/
│   │   ├── modules/
│   │   │   └── product/
│   │   └── index.ts
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
└── docker-compose.yml
```

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` in both services and configure environment variables
3. Run `docker-compose up` to start all services

## API Documentation

Swagger documentation is available at:
- Auth Service: `http://localhost:3000/api-docs`
- Product Service: `http://localhost:3001/api-docs`

## Testing

Each service includes unit tests for business logic. Run tests with:

```bash
npm test
```

## Event-Driven Architecture

The services communicate through RabbitMQ events:
- `user.created`: Published when a new user is created
- `user.updated`: Published when user details are updated
- `user.deleted`: Published when a user is deleted

## License

MIT