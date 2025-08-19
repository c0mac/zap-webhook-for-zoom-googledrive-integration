# Zoom Google Drive Webhook API - Project Structure

This project has been restructured to follow a clean, modular architecture with separation of concerns.

## Directory Structure

```
src/
├── controllers/          # Business logic handlers
│   ├── webhookController.js
│   └── healthController.js
├── middleware/           # Express middleware
│   ├── rateLimiter.js
│   └── errorHandler.js
├── routes/              # Route definitions
│   ├── index.js
│   └── webhookRoutes.js
├── validators/          # Input validation schemas
│   └── webhookValidator.js
├── utils/               # Utility functions
│   └── helpers.js
├── app.js              # Main Express app configuration
└── README.md           # This file
```

## Architecture Overview

### Controllers (`/controllers`)

- **webhookController.js**: Handles the main webhook logic for fetching Zoom recordings
- **healthController.js**: Handles health check and root endpoint responses

### Middleware (`/middleware`)

- **rateLimiter.js**: Rate limiting configuration for API endpoints
- **errorHandler.js**: Global error handling and 404 response middleware

### Routes (`/routes`)

- **index.js**: Main router that combines all route modules
- **webhookRoutes.js**: Webhook-specific routes

### Validators (`/validators`)

- **webhookValidator.js**: Joi validation schema for webhook parameters

### Utils (`/utils`)

- **helpers.js**: Common utility functions for request ID generation, error handling, and parameter sanitization

### App Configuration (`/app.js`)

- Main Express application setup with middleware and route registration

## Benefits of This Structure

1. **Separation of Concerns**: Each component has a single responsibility
2. **Maintainability**: Easy to locate and modify specific functionality
3. **Testability**: Individual components can be tested in isolation
4. **Scalability**: Easy to add new routes, controllers, and middleware
5. **Reusability**: Utility functions and middleware can be reused across the application

## Usage

The main entry point remains `server.js` in the root directory, which imports the configured app from `src/app.js`. This maintains compatibility with Vercel deployment while providing a clean, organized codebase.
