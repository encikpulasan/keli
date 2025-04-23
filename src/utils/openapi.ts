import { createRoute, OpenAPIHono, z } from "npm:@hono/zod-openapi";

// Define your OpenAPI document
export const openAPIDocument = {
  openapi: "3.0.0",
  info: {
    title: "Keli API",
    version: "1.0.0",
    description: "API documentation for the Keli application",
    contact: {
      name: "API Support",
      email: "support@example.com",
    },
  },
  servers: [
    {
      url: "/api/v1",
      description: "API v1",
    },
  ],
  tags: [
    {
      name: "System",
      description: "System-related endpoints",
    },
    {
      name: "Authentication",
      description: "Authentication and authorization endpoints",
    },
    {
      name: "Products",
      description: "Product management endpoints",
    },
    {
      name: "Orders",
      description: "Order management endpoints",
    },
    {
      name: "Stores",
      description: "Store management endpoints",
    },
    {
      name: "Payments",
      description: "Payment processing endpoints",
    },
    {
      name: "Inventory",
      description: "Inventory management endpoints",
    },
    {
      name: "Loyalty",
      description: "Loyalty program endpoints",
    },
    {
      name: "Promotions",
      description: "Promotional offers endpoints",
    },
    {
      name: "Notifications",
      description: "Notification management endpoints",
    },
    {
      name: "Admin",
      description: "Admin dashboard endpoints",
    },
    {
      name: "Customer",
      description: "Mobile app customer endpoints",
    },
    {
      name: "POS",
      description: "Point of Sale system endpoints for in-store operations",
    },
  ],
  "x-tagGroups": [
    {
      "name": "Audiences",
      "tags": ["Admin", "Customer", "POS"],
    },
    {
      "name": "Resources",
      "tags": [
        "System",
        "Authentication",
        "Products",
        "Orders",
        "Stores",
        "Payments",
        "Inventory",
        "Loyalty",
        "Promotions",
        "Notifications",
      ],
    },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["System", "Admin", "Customer"],
        summary: "Health check endpoint",
        description:
          "Returns the API health status. Available for both admin and customer clients.",
        responses: {
          "200": {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "ok",
                    },
                    environment: {
                      type: "string",
                      example: "development",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Authentication", "Admin", "Customer"],
        summary: "User login",
        description:
          "Authenticates a user and returns a JWT token. Available for both admin dashboard and customer mobile app.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    example: "password123",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: {
                      type: "string",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                    user: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          example: "user123",
                        },
                        email: {
                          type: "string",
                          example: "user@example.com",
                        },
                        role: {
                          type: "string",
                          example: "customer",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Invalid email or password",
                    },
                    error: {
                      type: "string",
                      example: "Unauthorized",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Authentication", "Customer"],
        summary: "User registration",
        description:
          "Registers a new customer user. Only available in the customer mobile app.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "name"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "newuser@example.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    example: "password123",
                  },
                  name: {
                    type: "string",
                    example: "John Doe",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      example: "user123",
                    },
                    email: {
                      type: "string",
                      example: "newuser@example.com",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Email already in use",
                    },
                    error: {
                      type: "string",
                      example: "Bad Request",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/products": {
      get: {
        tags: ["Products", "Admin", "Customer"],
        summary: "List all products",
        description:
          "Returns a list of all available products. Available for both admin dashboard and customer mobile app.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "category",
            in: "query",
            description: "Filter products by category",
            schema: {
              type: "string",
            },
          },
          {
            name: "limit",
            in: "query",
            description: "Maximum number of products to return",
            schema: {
              type: "integer",
              default: 20,
            },
          },
          {
            name: "offset",
            in: "query",
            description: "Number of products to skip",
            schema: {
              type: "integer",
              default: 0,
            },
          },
        ],
        responses: {
          "200": {
            description: "List of products",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    products: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Product",
                      },
                    },
                    total: {
                      type: "integer",
                      example: 42,
                    },
                    limit: {
                      type: "integer",
                      example: 20,
                    },
                    offset: {
                      type: "integer",
                      example: 0,
                    },
                  },
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
        },
      },
      post: {
        tags: ["Products", "Admin"],
        summary: "Create a new product",
        description:
          "Creates a new product in the catalog. Admin dashboard only.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ProductInput",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Product created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Product",
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/BadRequest",
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "403": {
            $ref: "#/components/responses/Forbidden",
          },
        },
      },
    },
    "/products/{id}": {
      get: {
        tags: ["Products", "Admin", "Customer"],
        summary: "Get product details",
        description:
          "Returns detailed information about a specific product. Available for both admin dashboard and customer mobile app.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Product ID",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Product details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Product",
                },
              },
            },
          },
          "404": {
            $ref: "#/components/responses/NotFound",
          },
        },
      },
      put: {
        tags: ["Products", "Admin"],
        summary: "Update a product",
        description:
          "Updates information for an existing product. Admin dashboard only.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Product ID",
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ProductInput",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Product updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Product",
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/BadRequest",
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "403": {
            $ref: "#/components/responses/Forbidden",
          },
          "404": {
            $ref: "#/components/responses/NotFound",
          },
        },
      },
      delete: {
        tags: ["Products", "Admin"],
        summary: "Delete a product",
        description:
          "Removes a product from the catalog. Admin dashboard only.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Product ID",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "204": {
            description: "Product deleted successfully",
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "403": {
            $ref: "#/components/responses/Forbidden",
          },
          "404": {
            $ref: "#/components/responses/NotFound",
          },
        },
      },
    },
    "/orders": {
      get: {
        tags: ["Orders", "Admin", "Customer"],
        summary: "List orders",
        description:
          "Returns a list of orders. For admin dashboard (all orders) and customer app (user's own orders).",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "status",
            in: "query",
            description: "Filter orders by status",
            schema: {
              type: "string",
              enum: ["pending", "processing", "completed", "cancelled"],
            },
          },
          {
            name: "limit",
            in: "query",
            description: "Maximum number of orders to return",
            schema: {
              type: "integer",
              default: 20,
            },
          },
          {
            name: "offset",
            in: "query",
            description: "Number of orders to skip",
            schema: {
              type: "integer",
              default: 0,
            },
          },
        ],
        responses: {
          "200": {
            description: "List of orders",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    orders: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Order",
                      },
                    },
                    total: {
                      type: "integer",
                      example: 15,
                    },
                    limit: {
                      type: "integer",
                      example: 20,
                    },
                    offset: {
                      type: "integer",
                      example: 0,
                    },
                  },
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
        },
      },
      post: {
        tags: ["Orders", "Customer"],
        summary: "Create a new order",
        description: "Places a new order. Customer mobile app only.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/OrderInput",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Order created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Order",
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/BadRequest",
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
        },
      },
    },
    "/stores": {
      get: {
        tags: ["Stores", "Admin", "Customer"],
        summary: "List all stores",
        description:
          "Returns a list of all store locations. Available for both admin dashboard and customer mobile app.",
        parameters: [
          {
            name: "latitude",
            in: "query",
            description: "Latitude for location-based search",
            schema: {
              type: "number",
            },
          },
          {
            name: "longitude",
            in: "query",
            description: "Longitude for location-based search",
            schema: {
              type: "number",
            },
          },
          {
            name: "radius",
            in: "query",
            description: "Search radius in kilometers",
            schema: {
              type: "number",
              default: 10,
            },
          },
        ],
        responses: {
          "200": {
            description: "List of stores",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    stores: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Store",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/payments/process": {
      post: {
        tags: ["Payments", "Customer"],
        summary: "Process a payment",
        description:
          "Processes a payment for an order. Customer mobile app only.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["orderId", "paymentMethod", "amount"],
                properties: {
                  orderId: {
                    type: "string",
                    example: "order123",
                  },
                  paymentMethod: {
                    type: "string",
                    enum: [
                      "credit_card",
                      "debit_card",
                      "mobile_payment",
                      "points",
                    ],
                    example: "credit_card",
                  },
                  amount: {
                    type: "number",
                    example: 25.99,
                  },
                  cardDetails: {
                    type: "object",
                    properties: {
                      cardNumber: {
                        type: "string",
                        example: "4111111111111111",
                      },
                      expiryMonth: {
                        type: "string",
                        example: "12",
                      },
                      expiryYear: {
                        type: "string",
                        example: "2025",
                      },
                      cvv: {
                        type: "string",
                        example: "123",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Payment processed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    paymentId: {
                      type: "string",
                      example: "pay_12345",
                    },
                    status: {
                      type: "string",
                      example: "success",
                    },
                    orderId: {
                      type: "string",
                      example: "order123",
                    },
                    amount: {
                      type: "number",
                      example: 25.99,
                    },
                    currency: {
                      type: "string",
                      example: "USD",
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/BadRequest",
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "402": {
            description: "Payment Required",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Payment failed: Insufficient funds",
                    },
                    error: {
                      type: "string",
                      example: "Payment Failed",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/loyalty/points": {
      get: {
        tags: ["Loyalty", "Customer"],
        summary: "Get loyalty points",
        description:
          "Returns the current loyalty points for the authenticated user. Customer mobile app only.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Loyalty points information",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    points: {
                      type: "integer",
                      example: 350,
                    },
                    tier: {
                      type: "string",
                      example: "Gold",
                    },
                    nextTier: {
                      type: "string",
                      example: "Platinum",
                    },
                    pointsToNextTier: {
                      type: "integer",
                      example: 150,
                    },
                    history: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          date: {
                            type: "string",
                            format: "date-time",
                          },
                          description: {
                            type: "string",
                            example: "Purchase at Store #123",
                          },
                          points: {
                            type: "integer",
                            example: 25,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
        },
      },
    },
    "/promotions/current": {
      get: {
        tags: ["Promotions", "Customer"],
        summary: "Get current promotions",
        description:
          "Returns a list of active promotions. Customer mobile app only.",
        responses: {
          "200": {
            description: "List of active promotions",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    promotions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string",
                            example: "promo123",
                          },
                          title: {
                            type: "string",
                            example: "Summer Special",
                          },
                          description: {
                            type: "string",
                            example: "Get 20% off on all cold drinks",
                          },
                          discount: {
                            type: "number",
                            example: 20,
                          },
                          discountType: {
                            type: "string",
                            enum: ["percentage", "fixed"],
                            example: "percentage",
                          },
                          validFrom: {
                            type: "string",
                            format: "date-time",
                          },
                          validTo: {
                            type: "string",
                            format: "date-time",
                          },
                          appliesTo: {
                            type: "array",
                            items: {
                              type: "string",
                            },
                            example: ["cold_coffee", "cold_tea"],
                          },
                          image: {
                            type: "string",
                            format: "uri",
                            example: "https://example.com/promo.jpg",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/inventory/stock": {
      get: {
        tags: ["Inventory", "Admin"],
        summary: "Get inventory stock",
        description:
          "Returns the current inventory stock. Admin dashboard only.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "storeId",
            in: "query",
            description: "Filter inventory by store ID",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Inventory stock information",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    storeId: {
                      type: "string",
                      example: "store123",
                    },
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          productId: {
                            type: "string",
                            example: "prod123",
                          },
                          productName: {
                            type: "string",
                            example: "Espresso Beans",
                          },
                          quantity: {
                            type: "integer",
                            example: 150,
                          },
                          unit: {
                            type: "string",
                            example: "kg",
                          },
                          threshold: {
                            type: "integer",
                            example: 20,
                          },
                          status: {
                            type: "string",
                            enum: ["in_stock", "low_stock", "out_of_stock"],
                            example: "in_stock",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "403": {
            $ref: "#/components/responses/Forbidden",
          },
        },
      },
    },
    "/notifications/settings": {
      get: {
        tags: ["Notifications", "Customer"],
        summary: "Get notification settings",
        description:
          "Returns the notification settings for the authenticated user. Customer mobile app only.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Notification settings",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: {
                      type: "boolean",
                      example: true,
                    },
                    push: {
                      type: "boolean",
                      example: true,
                    },
                    sms: {
                      type: "boolean",
                      example: false,
                    },
                    preferences: {
                      type: "object",
                      properties: {
                        orderStatus: {
                          type: "boolean",
                          example: true,
                        },
                        promotions: {
                          type: "boolean",
                          example: true,
                        },
                        newProducts: {
                          type: "boolean",
                          example: false,
                        },
                        loyaltyUpdates: {
                          type: "boolean",
                          example: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
        },
      },
      put: {
        tags: ["Notifications", "Customer"],
        summary: "Update notification settings",
        description:
          "Updates the notification settings for the authenticated user. Customer mobile app only.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "boolean",
                  },
                  push: {
                    type: "boolean",
                  },
                  sms: {
                    type: "boolean",
                  },
                  preferences: {
                    type: "object",
                    properties: {
                      orderStatus: {
                        type: "boolean",
                      },
                      promotions: {
                        type: "boolean",
                      },
                      newProducts: {
                        type: "boolean",
                      },
                      loyaltyUpdates: {
                        type: "boolean",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Notification settings updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Notification settings updated successfully",
                    },
                  },
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/BadRequest",
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
        },
      },
    },
    "/admin/dashboard": {
      get: {
        tags: ["Admin"],
        summary: "Admin dashboard statistics",
        description:
          "Returns statistics and metrics for the admin dashboard. Admin only.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Dashboard statistics",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    salesSummary: {
                      type: "object",
                      properties: {
                        daily: {
                          type: "number",
                          example: 2450.75,
                        },
                        weekly: {
                          type: "number",
                          example: 15680.50,
                        },
                        monthly: {
                          type: "number",
                          example: 68450.25,
                        },
                      },
                    },
                    orderStats: {
                      type: "object",
                      properties: {
                        pending: {
                          type: "integer",
                          example: 12,
                        },
                        processing: {
                          type: "integer",
                          example: 8,
                        },
                        completed: {
                          type: "integer",
                          example: 45,
                        },
                        cancelled: {
                          type: "integer",
                          example: 3,
                        },
                      },
                    },
                    topProducts: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string",
                            example: "prod123",
                          },
                          name: {
                            type: "string",
                            example: "Cappuccino",
                          },
                          sales: {
                            type: "integer",
                            example: 120,
                          },
                          revenue: {
                            type: "number",
                            example: 598.80,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "403": {
            $ref: "#/components/responses/Forbidden",
          },
        },
      },
    },
    "/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List all users",
        description: "Returns a list of all users in the system. Admin only.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "role",
            in: "query",
            description: "Filter users by role",
            schema: {
              type: "string",
              enum: ["customer", "staff", "admin"],
            },
          },
          {
            name: "limit",
            in: "query",
            description: "Maximum number of users to return",
            schema: {
              type: "integer",
              default: 20,
            },
          },
          {
            name: "offset",
            in: "query",
            description: "Number of users to skip",
            schema: {
              type: "integer",
              default: 0,
            },
          },
        ],
        responses: {
          "200": {
            description: "List of users",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    users: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/User",
                      },
                    },
                    total: {
                      type: "integer",
                      example: 245,
                    },
                    limit: {
                      type: "integer",
                      example: 20,
                    },
                    offset: {
                      type: "integer",
                      example: 0,
                    },
                  },
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "403": {
            $ref: "#/components/responses/Forbidden",
          },
        },
      },
    },
    "/admin/reports/sales": {
      get: {
        tags: ["Admin"],
        summary: "Sales reports",
        description:
          "Generates sales reports for different time periods. Admin only.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "startDate",
            in: "query",
            required: true,
            description: "Start date for the report (YYYY-MM-DD)",
            schema: {
              type: "string",
              format: "date",
            },
          },
          {
            name: "endDate",
            in: "query",
            required: true,
            description: "End date for the report (YYYY-MM-DD)",
            schema: {
              type: "string",
              format: "date",
            },
          },
          {
            name: "groupBy",
            in: "query",
            description: "How to group the data",
            schema: {
              type: "string",
              enum: ["day", "week", "month", "product", "store"],
              default: "day",
            },
          },
        ],
        responses: {
          "200": {
            description: "Sales report data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reportType: {
                      type: "string",
                      example: "sales",
                    },
                    startDate: {
                      type: "string",
                      format: "date",
                    },
                    endDate: {
                      type: "string",
                      format: "date",
                    },
                    groupBy: {
                      type: "string",
                      example: "day",
                    },
                    totalSales: {
                      type: "number",
                      example: 24680.50,
                    },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          label: {
                            type: "string",
                            example: "2025-04-15",
                          },
                          sales: {
                            type: "number",
                            example: 1245.75,
                          },
                          transactions: {
                            type: "integer",
                            example: 85,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/BadRequest",
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "403": {
            $ref: "#/components/responses/Forbidden",
          },
        },
      },
    },
    "/customer/profile": {
      get: {
        tags: ["Customer"],
        summary: "Get customer profile",
        description:
          "Returns the profile information for the authenticated customer. Customer mobile app only.",
        security: [{ customerAuth: [] }],
        responses: {
          "200": {
            description: "Customer profile information",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      example: "user123",
                    },
                    name: {
                      type: "string",
                      example: "John Doe",
                    },
                    email: {
                      type: "string",
                      format: "email",
                      example: "john@example.com",
                    },
                    phone: {
                      type: "string",
                      example: "+1 (555) 123-4567",
                    },
                    preferences: {
                      type: "object",
                      properties: {
                        favoriteStoreId: {
                          type: "string",
                          example: "store123",
                        },
                        defaultPaymentMethod: {
                          type: "string",
                          example: "card_123456",
                        },
                      },
                    },
                    createdAt: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
        },
      },
      put: {
        tags: ["Customer"],
        summary: "Update customer profile",
        description:
          "Updates the profile information for the authenticated customer. Customer mobile app only.",
        security: [{ customerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    example: "John Doe",
                  },
                  phone: {
                    type: "string",
                    example: "+1 (555) 123-4567",
                  },
                  preferences: {
                    type: "object",
                    properties: {
                      favoriteStoreId: {
                        type: "string",
                        example: "store123",
                      },
                      defaultPaymentMethod: {
                        type: "string",
                        example: "card_123456",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Profile updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Profile updated successfully",
                    },
                  },
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/BadRequest",
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
        },
      },
    },
    "/pos/auth/login": {
      post: {
        tags: ["Authentication", "POS"],
        summary: "POS system login",
        description: "Authenticates a staff member for POS system access.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "storeId"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "staff@example.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    example: "password123",
                  },
                  storeId: {
                    type: "string",
                    example: "store123",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: {
                      type: "string",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                    user: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          example: "user123",
                        },
                        email: {
                          type: "string",
                          example: "staff@example.com",
                        },
                        name: {
                          type: "string",
                          example: "Jane Smith",
                        },
                        role: {
                          type: "string",
                          example: "staff",
                        },
                        storeId: {
                          type: "string",
                          example: "store123",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
        },
      },
    },
    "/pos/orders/queue": {
      get: {
        tags: ["Orders", "POS"],
        summary: "Get order queue",
        description:
          "Returns the current queue of orders for a specific store. For POS system.",
        security: [{ posAuth: [] }],
        parameters: [
          {
            name: "storeId",
            in: "query",
            required: true,
            description: "Store ID",
            schema: {
              type: "string",
            },
          },
          {
            name: "status",
            in: "query",
            description: "Filter orders by status",
            schema: {
              type: "string",
              enum: ["pending", "preparing", "ready", "completed", "cancelled"],
            },
          },
        ],
        responses: {
          "200": {
            description: "Order queue",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    storeId: {
                      type: "string",
                      example: "store123",
                    },
                    orders: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/POSOrder",
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "403": {
            $ref: "#/components/responses/Forbidden",
          },
        },
      },
    },
    "/pos/orders/{id}/status": {
      put: {
        tags: ["Orders", "POS"],
        summary: "Update order status",
        description: "Updates the status of an order. For POS system.",
        security: [{ posAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Order ID",
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: {
                    type: "string",
                    enum: [
                      "pending",
                      "preparing",
                      "ready",
                      "completed",
                      "cancelled",
                    ],
                    example: "preparing",
                  },
                  estimatedReadyTime: {
                    type: "string",
                    format: "date-time",
                    description: "Estimated time when the order will be ready",
                  },
                  notes: {
                    type: "string",
                    example: "Customer requested extra napkins",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Order status updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      example: "order123",
                    },
                    status: {
                      type: "string",
                      example: "preparing",
                    },
                    estimatedReadyTime: {
                      type: "string",
                      format: "date-time",
                    },
                    updatedAt: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/BadRequest",
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "403": {
            $ref: "#/components/responses/Forbidden",
          },
          "404": {
            $ref: "#/components/responses/NotFound",
          },
        },
      },
    },
    "/pos/orders/receive": {
      post: {
        tags: ["Orders", "POS"],
        summary: "Receive order from customer app",
        description:
          "Endpoint for the POS system to receive new orders from the customer mobile app.",
        security: [{ posAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["orderId", "storeId"],
                properties: {
                  orderId: {
                    type: "string",
                    example: "order123",
                  },
                  storeId: {
                    type: "string",
                    example: "store123",
                  },
                  acknowledgeReceipt: {
                    type: "boolean",
                    example: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Order received successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    orderId: {
                      type: "string",
                      example: "order123",
                    },
                    receiptTime: {
                      type: "string",
                      format: "date-time",
                    },
                    estimatedReadyTime: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/BadRequest",
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "403": {
            $ref: "#/components/responses/Forbidden",
          },
        },
      },
    },
    "/pos/orders": {
      post: {
        tags: ["Orders", "POS"],
        summary: "Create in-store order",
        description: "Creates a new in-store order through the POS system.",
        security: [{ posAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["storeId", "items"],
                properties: {
                  storeId: {
                    type: "string",
                    example: "store123",
                  },
                  customerId: {
                    type: "string",
                    description: "Optional customer ID for loyalty program",
                    example: "user123",
                  },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["productId", "quantity"],
                      properties: {
                        productId: {
                          type: "string",
                          example: "prod123",
                        },
                        quantity: {
                          type: "integer",
                          minimum: 1,
                          example: 2,
                        },
                        customizations: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: {
                                type: "string",
                                example: "Extra shot",
                              },
                              price: {
                                type: "number",
                                example: 0.99,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  paymentMethod: {
                    type: "string",
                    enum: [
                      "cash",
                      "credit_card",
                      "debit_card",
                      "mobile_payment",
                    ],
                    example: "credit_card",
                  },
                  notes: {
                    type: "string",
                    example: "Urgent order",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Order created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/POSOrder",
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/BadRequest",
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "403": {
            $ref: "#/components/responses/Forbidden",
          },
        },
      },
    },
    "/pos/payments/process": {
      post: {
        tags: ["Payments", "POS"],
        summary: "Process in-store payment",
        description:
          "Processes a payment for an in-store order through the POS system.",
        security: [{ posAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["orderId", "paymentMethod", "amount"],
                properties: {
                  orderId: {
                    type: "string",
                    example: "order123",
                  },
                  paymentMethod: {
                    type: "string",
                    enum: [
                      "cash",
                      "credit_card",
                      "debit_card",
                      "mobile_payment",
                      "points",
                    ],
                    example: "credit_card",
                  },
                  amount: {
                    type: "number",
                    example: 25.99,
                  },
                  cardDetails: {
                    type: "object",
                    properties: {
                      cardNumber: {
                        type: "string",
                        example: "4111111111111111",
                      },
                      expiryMonth: {
                        type: "string",
                        example: "12",
                      },
                      expiryYear: {
                        type: "string",
                        example: "2025",
                      },
                      cvv: {
                        type: "string",
                        example: "123",
                      },
                    },
                  },
                  cashReceived: {
                    type: "number",
                    example: 30.00,
                  },
                  cashChange: {
                    type: "number",
                    example: 4.01,
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Payment processed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    paymentId: {
                      type: "string",
                      example: "pay_12345",
                    },
                    status: {
                      type: "string",
                      example: "success",
                    },
                    orderId: {
                      type: "string",
                      example: "order123",
                    },
                    amount: {
                      type: "number",
                      example: 25.99,
                    },
                    currency: {
                      type: "string",
                      example: "USD",
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time",
                    },
                    receiptUrl: {
                      type: "string",
                      format: "uri",
                      example: "https://example.com/receipts/12345",
                    },
                  },
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/BadRequest",
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "402": {
            description: "Payment Required",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Payment failed: Card declined",
                    },
                    error: {
                      type: "string",
                      example: "Payment Failed",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/pos/inventory": {
      get: {
        tags: ["Inventory", "POS"],
        summary: "Get store inventory",
        description:
          "Returns the current inventory for a specific store. For POS system.",
        security: [{ posAuth: [] }],
        parameters: [
          {
            name: "storeId",
            in: "query",
            required: true,
            description: "Store ID",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Store inventory",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    storeId: {
                      type: "string",
                      example: "store123",
                    },
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          productId: {
                            type: "string",
                            example: "prod123",
                          },
                          productName: {
                            type: "string",
                            example: "Espresso Beans",
                          },
                          quantity: {
                            type: "integer",
                            example: 150,
                          },
                          unit: {
                            type: "string",
                            example: "kg",
                          },
                          threshold: {
                            type: "integer",
                            example: 20,
                          },
                          status: {
                            type: "string",
                            enum: ["in_stock", "low_stock", "out_of_stock"],
                            example: "in_stock",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "403": {
            $ref: "#/components/responses/Forbidden",
          },
        },
      },
    },
    "/pos/inventory/update": {
      post: {
        tags: ["Inventory", "POS"],
        summary: "Update inventory items",
        description:
          "Updates inventory quantities for products at a specific store. For POS system.",
        security: [{ posAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["storeId", "items"],
                properties: {
                  storeId: {
                    type: "string",
                    example: "store123",
                  },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["productId", "quantity"],
                      properties: {
                        productId: {
                          type: "string",
                          example: "prod123",
                        },
                        quantity: {
                          type: "integer",
                          example: 180,
                        },
                        reason: {
                          type: "string",
                          enum: [
                            "restock",
                            "adjustment",
                            "damage",
                            "waste",
                            "transfer",
                          ],
                          example: "restock",
                        },
                        notes: {
                          type: "string",
                          example: "Weekly delivery",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Inventory updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    storeId: {
                      type: "string",
                      example: "store123",
                    },
                    updatedItems: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          productId: {
                            type: "string",
                            example: "prod123",
                          },
                          previousQuantity: {
                            type: "integer",
                            example: 150,
                          },
                          newQuantity: {
                            type: "integer",
                            example: 180,
                          },
                          status: {
                            type: "string",
                            enum: ["in_stock", "low_stock", "out_of_stock"],
                            example: "in_stock",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/BadRequest",
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "403": {
            $ref: "#/components/responses/Forbidden",
          },
        },
      },
    },
    "/pos/promotions/apply": {
      post: {
        tags: ["Promotions", "POS"],
        summary: "Apply promotion to order",
        description: "Applies a promotion code to an order. For POS system.",
        security: [{ posAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["orderId", "promotionCode"],
                properties: {
                  orderId: {
                    type: "string",
                    example: "order123",
                  },
                  promotionCode: {
                    type: "string",
                    example: "SUMMER20",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Promotion applied successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    orderId: {
                      type: "string",
                      example: "order123",
                    },
                    promotion: {
                      type: "object",
                      properties: {
                        code: {
                          type: "string",
                          example: "SUMMER20",
                        },
                        description: {
                          type: "string",
                          example: "20% off summer drinks",
                        },
                        discountType: {
                          type: "string",
                          enum: ["percentage", "fixed"],
                          example: "percentage",
                        },
                        discountValue: {
                          type: "number",
                          example: 20,
                        },
                      },
                    },
                    originalTotal: {
                      type: "number",
                      example: 15.99,
                    },
                    discountAmount: {
                      type: "number",
                      example: 3.20,
                    },
                    newTotal: {
                      type: "number",
                      example: 12.79,
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid or expired promotion code",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: false,
                    },
                    message: {
                      type: "string",
                      example: "This promotion code is invalid or has expired",
                    },
                  },
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "403": {
            $ref: "#/components/responses/Forbidden",
          },
          "404": {
            $ref: "#/components/responses/NotFound",
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "JWT-based authentication. Required for all protected endpoints. The token contains role information that determines access level (admin, staff, or customer).",
      },
      adminAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "JWT-based authentication for admin users only. Admin tokens contain the role='admin' claim.",
      },
      customerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "JWT-based authentication for customer users. Customer tokens contain the role='customer' claim.",
      },
      posAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "JWT-based authentication for POS staff users. POS tokens contain the role='staff' claim and storeId.",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          message: {
            type: "string",
          },
          error: {
            type: "string",
          },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "prod123",
          },
          name: {
            type: "string",
            example: "Cappuccino",
          },
          description: {
            type: "string",
            example: "Espresso with steamed milk and foam",
          },
          price: {
            type: "number",
            example: 4.99,
          },
          category: {
            type: "string",
            example: "hot_coffee",
          },
          image: {
            type: "string",
            format: "uri",
            example: "https://example.com/cappuccino.jpg",
          },
          allergens: {
            type: "array",
            items: {
              type: "string",
            },
            example: ["milk"],
          },
          available: {
            type: "boolean",
            example: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      ProductInput: {
        type: "object",
        required: ["name", "price", "category"],
        properties: {
          name: {
            type: "string",
            example: "Cappuccino",
          },
          description: {
            type: "string",
            example: "Espresso with steamed milk and foam",
          },
          price: {
            type: "number",
            example: 4.99,
          },
          category: {
            type: "string",
            example: "hot_coffee",
          },
          image: {
            type: "string",
            format: "uri",
            example: "https://example.com/cappuccino.jpg",
          },
          allergens: {
            type: "array",
            items: {
              type: "string",
            },
            example: ["milk"],
          },
          available: {
            type: "boolean",
            example: true,
          },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "order123",
          },
          userId: {
            type: "string",
            example: "user123",
          },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productId: {
                  type: "string",
                  example: "prod123",
                },
                name: {
                  type: "string",
                  example: "Cappuccino",
                },
                quantity: {
                  type: "integer",
                  example: 2,
                },
                unitPrice: {
                  type: "number",
                  example: 4.99,
                },
                totalPrice: {
                  type: "number",
                  example: 9.98,
                },
                customizations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        example: "Extra shot",
                      },
                      price: {
                        type: "number",
                        example: 0.99,
                      },
                    },
                  },
                },
              },
            },
          },
          storeId: {
            type: "string",
            example: "store123",
          },
          status: {
            type: "string",
            enum: ["pending", "processing", "completed", "cancelled"],
            example: "processing",
          },
          subtotal: {
            type: "number",
            example: 9.98,
          },
          tax: {
            type: "number",
            example: 0.80,
          },
          total: {
            type: "number",
            example: 10.78,
          },
          paymentStatus: {
            type: "string",
            enum: ["pending", "paid", "failed"],
            example: "paid",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      OrderInput: {
        type: "object",
        required: ["storeId", "items"],
        properties: {
          storeId: {
            type: "string",
            example: "store123",
          },
          items: {
            type: "array",
            items: {
              type: "object",
              required: ["productId", "quantity"],
              properties: {
                productId: {
                  type: "string",
                  example: "prod123",
                },
                quantity: {
                  type: "integer",
                  minimum: 1,
                  example: 2,
                },
                customizations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        example: "Extra shot",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      Store: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "store123",
          },
          name: {
            type: "string",
            example: "Downtown Cafe",
          },
          address: {
            type: "string",
            example: "123 Main St, San Francisco, CA 94105",
          },
          location: {
            type: "object",
            properties: {
              latitude: {
                type: "number",
                example: 37.7749,
              },
              longitude: {
                type: "number",
                example: -122.4194,
              },
            },
          },
          hours: {
            type: "object",
            properties: {
              monday: {
                type: "string",
                example: "7:00 AM - 8:00 PM",
              },
              tuesday: {
                type: "string",
                example: "7:00 AM - 8:00 PM",
              },
              wednesday: {
                type: "string",
                example: "7:00 AM - 8:00 PM",
              },
              thursday: {
                type: "string",
                example: "7:00 AM - 8:00 PM",
              },
              friday: {
                type: "string",
                example: "7:00 AM - 9:00 PM",
              },
              saturday: {
                type: "string",
                example: "8:00 AM - 9:00 PM",
              },
              sunday: {
                type: "string",
                example: "8:00 AM - 7:00 PM",
              },
            },
          },
          phone: {
            type: "string",
            example: "+1 (555) 123-4567",
          },
          amenities: {
            type: "array",
            items: {
              type: "string",
            },
            example: ["wifi", "seating", "drive_thru"],
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "user123",
          },
          email: {
            type: "string",
            format: "email",
            example: "user@example.com",
          },
          name: {
            type: "string",
            example: "John Doe",
          },
          role: {
            type: "string",
            enum: ["customer", "staff", "admin"],
            example: "customer",
          },
          phone: {
            type: "string",
            example: "+1 (555) 123-4567",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          lastLogin: {
            type: "string",
            format: "date-time",
          },
        },
      },
      POSOrder: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "order123",
          },
          userId: {
            type: "string",
            example: "user123",
          },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productId: {
                  type: "string",
                  example: "prod123",
                },
                name: {
                  type: "string",
                  example: "Cappuccino",
                },
                quantity: {
                  type: "integer",
                  example: 2,
                },
                unitPrice: {
                  type: "number",
                  example: 4.99,
                },
                totalPrice: {
                  type: "number",
                  example: 9.98,
                },
                customizations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        example: "Extra shot",
                      },
                      price: {
                        type: "number",
                        example: 0.99,
                      },
                    },
                  },
                },
              },
            },
          },
          storeId: {
            type: "string",
            example: "store123",
          },
          status: {
            type: "string",
            enum: ["pending", "processing", "completed", "cancelled"],
            example: "processing",
          },
          subtotal: {
            type: "number",
            example: 9.98,
          },
          tax: {
            type: "number",
            example: 0.80,
          },
          total: {
            type: "number",
            example: 10.78,
          },
          paymentStatus: {
            type: "string",
            enum: ["pending", "paid", "failed"],
            example: "paid",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
    },
    responses: {
      BadRequest: {
        description: "Bad Request",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
            example: {
              message: "Invalid input data",
              error: "Bad Request",
            },
          },
        },
      },
      Unauthorized: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
            example: {
              message: "Authentication required",
              error: "Unauthorized",
            },
          },
        },
      },
      Forbidden: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
            example: {
              message: "You don't have permission to perform this action",
              error: "Forbidden",
            },
          },
        },
      },
      NotFound: {
        description: "Not Found",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
            example: {
              message: "Resource not found",
              error: "Not Found",
            },
          },
        },
      },
    },
  },
};

// Create routes with OpenAPIHono instance and schema definitions
export function createHealthCheckRoute() {
  return createRoute({
    method: "get",
    path: "/health",
    tags: ["System"],
    summary: "Health check endpoint",
    description: "Returns the API health status",
    responses: {
      200: {
        description: "API is healthy",
        content: {
          "application/json": {
            schema: z.object({
              status: z.string(),
              version: z.string(),
              timestamp: z.string(),
            }),
          },
        },
      },
    },
  });
}

// Helper function to register OpenAPI routes
export function registerOpenAPIRoutes(app: OpenAPIHono) {
  app.doc("/openapi.json", {
    openapi: openAPIDocument.openapi,
    info: openAPIDocument.info,
    servers: openAPIDocument.servers,
  });
}
