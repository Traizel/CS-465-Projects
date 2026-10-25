# CS 465 — Full Stack Development

This repository contains my coursework from CS 465: Full Stack Development at Southern New Hampshire University, completed as part of my Computer Science bachelor’s degree studies with a Software Engineering concentration.

The project follows the development of **Travlr Getaways**, a travel application that combines a customer-facing website with an Angular administration interface. Each module builds on the previous version, progressing from an Express application to a full-stack system with database persistence, a REST API, and authenticated trip management.

## Project Overview

Travlr Getaways demonstrates how multiple application layers work together:

- A customer-facing website renders travel information using Express and Handlebars.
- A REST API provides access to trip data.
- MongoDB stores trips and user accounts, with Mongoose handling schemas and validation.
- An Angular application supports trip listing, creation, and editing.
- Passport and JSON Web Tokens handle authentication and protect API write operations.

## Technologies

| Area | Technologies |
| --- | --- |
| Frontend | Angular 17, TypeScript, Bootstrap, HTML, CSS |
| Server-rendered website | Express, Handlebars |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | Passport, JWT, salted password hashing |
| Testing | Node.js assertions, HTTP integration tests, mocked persistence, Postman |

## Repository Structure

Each module directory preserves a separate stage of the application’s development.

| Directory | Development Focus |
| --- | --- |
| `Module 1 travlr` | Initial Express application and website assets |
| `Module 2 travlr` | MVC organization, controllers, routes, and templates |
| `Module 3 travlr` | Data-driven page rendering using JSON trip data |
| `Module 4 travlr` | MongoDB integration, Mongoose schemas, and database seeding |
| `Module 5 travlr` | REST API and API-driven website rendering |
| `Module 6 travlr` | Angular administration interface and trip management |
| `Module 7 travlr` | User authentication, JWT-protected endpoints, and authentication testing |

**Module 7 contains the most complete version.**

Its main components are:

```text
Module 7 travlr/
├── app_admin/     # Angular administration application
├── app_api/       # REST API, database models, and authentication
├── app_server/    # MVC controllers, routes, and Handlebars views
├── bin/           # Express server entry point
├── data/          # Sample trip data
├── postman/       # API request collections
├── public/        # Website assets
├── scripts/       # Local environment setup
├── tests/         # Schema, API, and authentication checks
└── app.js         # Express application configuration
```

## Features

### Customer-Facing Website

- Renders trip listings through Handlebars templates.
- Retrieves travel data from the REST API.
- Handles empty results and API connection errors.

### Trip Management

- Lists trips and retrieves individual trips by trip code.
- Provides API operations for creating, updating, and deleting trips.
- Includes Angular forms for adding and editing trips.

### Authentication

- Supports user registration and login through the API.
- Stores salted password hashes.
- Issues JWTs with a one-hour expiration.
- Requires valid authentication for trip creation, updates, and deletion.
- Uses Angular route guards and an HTTP interceptor to support authenticated requests.

## Running Module 7 Locally

### Prerequisites

- Node.js and npm compatible with the included Angular 17 tooling.
- A running MongoDB instance.
- Git.

### 1. Clone the Repository

```bash
git clone https://github.com/Traizel/CS-465-Projects.git
cd "CS-465-Projects/Module 7 travlr"
npm install
```

### 2. Configure the Environment

```bash
npm run setup:env
```

This creates a local `.env` file with:

- `MONGODB_URI`, pointing to the local `travlr` database.
- `JWT_SECRET`, generated randomly for local authentication.

An existing `.env` file is preserved. Update `MONGODB_URI` if your database uses a different connection address, and keep `.env` out of version control.

### 3. Load Sample Data

With MongoDB running:

```bash
npm run seed
npm run verify:db
```

The seed script replaces the trip collection in the configured database with the sample trips. Use a development database for this step.

### 4. Start the Express Application

```bash
npm start
```

The website runs at:

```text
http://localhost:3000
```

The trip API is available at:

```text
http://localhost:3000/api/trips
```

### 5. Start the Angular Application

In a second terminal, navigate to the Angular application:

```bash
cd "CS-465-Projects/Module 7 travlr/app_admin"
npm install
npm start
```

The administration interface runs at:

```text
http://localhost:4200
```

Keep the Express application and MongoDB running while using the Angular interface.

To use authenticated features, register a local account through `POST /api/register` with `name`, `email`, and `password` fields, then sign in through the Angular login page.

## API Endpoints

All endpoints below use the `/api` prefix.

| Method | Endpoint | Purpose | Authentication |
| --- | --- | --- | --- |
| GET | `/trips` | List trips | Public |
| GET | `/trips/:tripCode` | Retrieve a trip | Public |
| POST | `/register` | Register a user | Public |
| POST | `/login` | Sign in and receive a JWT | Public |
| POST | `/trips` | Create a trip | Required |
| PUT | `/trips/:tripCode` | Update a trip | Required |
| DELETE | `/trips/:tripCode` | Delete a trip | Required |

Protected requests use an `Authorization: Bearer <token>` header.

## Testing

Run these commands from `Module 7 travlr`.

### Schema and Live API Checks

With Express and MongoDB running:

```bash
npm test
```

This runs schema validation and Module 7 API checks covering registration, login, token handling, public reads, and authenticated trip operations.

The live tests create a test user and temporary trip data. The trip is removed after successful completion; the test user remains in the development database.

### Authentication Checks with Mocked Persistence

```bash
npm run test:module7:mock
```

This exercises the Express routes, authentication, and model validation using mocked database persistence.

### Angular Checks

From `app_admin`:

```bash
npm test
npm run build
```

The Angular `test` script performs TypeScript checking. The build command compiles the application.

Postman collections are also included for exploring and testing the API manually.

## What This Project Demonstrates

This project documents my experience connecting frontend interfaces, server-side application logic, and persistent data within one application.

Key areas include MVC architecture, reusable Angular components, REST API design, database modeling, authentication, and testing across application layers.

## Author

**Tre Olson**

- GitHub: [Traizel](https://github.com/Traizel)
- Professional portfolio: [dev.traizel.com](https://dev.traizel.com)
