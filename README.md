# 🚀 Project & Task Management API

A RESTful API for managing projects and tasks, built with **Node.js**, **Express**, **TypeScript**, **PostgreSQL**, and **Sequelize**. Features JWT-based authentication with refresh token rotation, role-based access control, input validation, and Swagger documentation.

---

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js v5
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Sequelize v6
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: Zod
- **API Docs**: Swagger / OpenAPI 3.0 (available at `/api-docs` when running)
- **Containerization**: Docker & Docker Compose

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **PostgreSQL** 15+ (or use Docker)
- **Docker & Docker Compose** (optional)

### Environment Variables

Copy the example environment file to create your `.env` configuration:
```bash
cp .env.example .env
```

---

## How to Run with Docker

Start the PostgreSQL database and the application together, and initialize the database:

```bash
# 1. Start all services (database + app)
docker-compose up -d --build

# 2. Run database migrations inside the container
docker-compose exec app npx sequelize-cli db:migrate

# 3. (Optional) Seed the database with sample data
docker-compose exec app npx sequelize-cli db:seed:all
```

- **API Base URL**: `http://localhost:3000`
- **Swagger API Docs (UI)**: `http://localhost:3000/api-docs`
- **Swagger JSON Specification**: `http://localhost:3000/api-docs.json` (Import this URL into Postman to generate a collection)

To stop all services:
```bash
docker-compose down
```

---

## How to Run Locally (without Docker)

### 1. Start PostgreSQL Database
Ensure you have a PostgreSQL database running (e.g. locally or via Docker port 5434 as configured in `.env.example`).
```bash
docker-compose up -d postgres
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Database Migrations & Seeds
```bash
# Run database migrations
npm run db:migrate

# (Optional) Seed the database with sample data
npm run db:seed
```

### 4. Start the Application
```bash
# Start development server
npm run start:dev

# Or build and start in production mode
npm run build
npm start
```

- **API Base URL**: `http://localhost:3000`
- **Swagger API Docs (UI)**: `http://localhost:3000/api-docs`
- **Swagger JSON Specification**: `http://localhost:3000/api-docs.json` (Import this URL into Postman to generate a collection)

---

## Running Tests

To execute the test suite:
```bash
npm test
```
