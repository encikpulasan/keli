# Keli API Service

A scalable and robust API service for coffee shop management built using Deno,
Hono and DenoKV.

## Features

- **Modern Tech Stack**: Built with Deno, Hono, and DenoKV
- **RESTful API**: Clean and consistent API design
- **Authentication**: JWT-based authentication for secure access
- **Role-Based Access Control**: Different APIs for Admin Dashboard, Customer
  App, and POS Systems
- **Validation**: Input validation using Zod schemas
- **Error Handling**: Comprehensive error handling with appropriate HTTP status
  codes
- **Pagination**: Support for cursor-based pagination
- **Environments**: Separate configurations for development, staging, and
  production
- **Logging**: Detailed request logging for monitoring and debugging
- **CORS**: Cross-Origin Resource Sharing configured for security
- **API Documentation**: Interactive API documentation with ReDoc

## Prerequisites

- [Deno](https://deno.land/) v1.30.0 or higher

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/your-username/keli-api.git
   cd keli-api
   ```

2. Set up environment variables (optional):
   ```
   export NODE_ENV=development # development, staging, or production
   export JWT_SECRET=your-secret-key # for production
   export KV_PATH=/path/to/your/kv/file # for persistent storage
   ```

3. Run the application:
   ```
   deno task start
   ```

   The API will be available at http://localhost:3000.

4. Access the API Documentation:

   Visit http://localhost:3000/docs to browse the interactive API documentation.

## Development

### Project Structure

```
keli/
├── src/
│   ├── config/               # Configuration files
│   │   ├── environments/     # Environment-specific configurations
│   │   └── index.ts          # Configuration loader
│   ├── controllers/          # Request handlers
│   ├── db/                   # Database setup and utilities
│   ├── middlewares/          # Middleware functions
│   ├── models/               # Data models and validation schemas
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   └── utils/                # Utility functions
│       ├── openapi.ts        # OpenAPI schema definitions
│       └── redoc.ts          # ReDoc UI configuration
├── .vscode/                  # VS Code configuration
├── .gitignore                # Git ignore file
├── deno.json                 # Deno configuration
├── deno.lock                 # Deno lock file
├── main.ts                   # Application entry point
└── README.md                 # Project documentation
```

### Available Scripts

- `deno task start` - Start the application
- `deno task dev` - Start the application with watch mode
- `deno task test` - Run tests

## API Structure

The API is organized by audience to serve different client applications:

### Admin Dashboard API

Admin-specific endpoints for managing the coffee shop business:

- Authentication and user management
- Product management (create, update, delete)
- Inventory management
- Order monitoring and fulfillment
- Sales reports and analytics
- Store management

Base URL prefix: `/api/v1/admin/*`

### Customer Mobile App API

Customer-facing endpoints for the mobile application:

- Registration and authentication
- Product browsing
- Order placement and tracking
- Loyalty points management
- Payment processing
- Store locations and information

Base URL prefix: `/api/v1/customer/*`

### POS (Point of Sale) API

Endpoints for in-store point of sale systems:

- Staff authentication
- Order queue management
- Order status updates
- In-store order creation
- Payment processing
- Inventory tracking
- Promotion application

Base URL prefix: `/api/v1/pos/*`

## API Documentation

The API documentation is available at http://localhost:3000/docs. It provides:

- Interactive documentation of all endpoints
- Request and response schemas
- Example requests and responses
- Authentication requirements
- Filter buttons to view endpoints by audience (Admin, Customer, POS)

## Security

The API uses JWT-based authentication with different token types:

- Admin tokens - For admin dashboard access
- Customer tokens - For mobile app users
- POS tokens - For in-store staff

Each token contains appropriate role claims and access permissions.

## License

This project is licensed under the MIT License.

## Created By

Keli Development Team

## Testing

### Test Script

The project includes a comprehensive test script (`test_endpoints.sh`) that
verifies all key endpoints are functioning correctly. This helps ensure API
stability across changes and deployments.

To run the tests:

```
./test_endpoints.sh
```

The test script automatically:

1. Authenticates with admin, customer, and POS accounts
2. Tests all major endpoints with appropriate data
3. Verifies response status codes
4. Reports a summary of passed and failed tests

### Test Endpoints

For testing purposes, some specialized endpoints have been created to facilitate
testing without interfering with production code:

- `/api/v1/test-orders` - A simplified order creation endpoint that bypasses
  complex validation
- Various mock endpoints that return test data for development purposes

### Recent Updates

Recent improvements to the testing infrastructure include:

- Fixed curl output handling in the test script to properly capture status codes
  and response bodies
- Added a dedicated test orders endpoint to facilitate testing without complex
  validation requirements
- Improved error reporting in the test script
- Simplified the admin sales reports endpoint testing
