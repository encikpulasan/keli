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
  ],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check endpoint",
        description: "Returns the API health status",
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
        tags: ["Authentication"],
        summary: "User login",
        description: "Authenticates a user and returns a JWT token",
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
        tags: ["Authentication"],
        summary: "User registration",
        description: "Registers a new user",
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
        tags: ["Products"],
        summary: "List all products",
        description: "Returns a list of all available products",
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
        tags: ["Products"],
        summary: "Create a new product",
        description: "Creates a new product in the catalog",
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
        tags: ["Products"],
        summary: "Get product details",
        description: "Returns detailed information about a specific product",
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
        tags: ["Products"],
        summary: "Update a product",
        description: "Updates information for an existing product",
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
        tags: ["Products"],
        summary: "Delete a product",
        description: "Removes a product from the catalog",
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
        tags: ["Orders"],
        summary: "List orders",
        description: "Returns a list of orders",
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
        tags: ["Orders"],
        summary: "Create a new order",
        description: "Places a new order",
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
        tags: ["Stores"],
        summary: "List all stores",
        description: "Returns a list of all store locations",
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
        tags: ["Payments"],
        summary: "Process a payment",
        description: "Processes a payment for an order",
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
        tags: ["Loyalty"],
        summary: "Get loyalty points",
        description:
          "Returns the current loyalty points for the authenticated user",
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
        tags: ["Promotions"],
        summary: "Get current promotions",
        description: "Returns a list of active promotions",
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
        tags: ["Inventory"],
        summary: "Get inventory stock",
        description: "Returns the current inventory stock",
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
        tags: ["Notifications"],
        summary: "Get notification settings",
        description:
          "Returns the notification settings for the authenticated user",
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
        tags: ["Notifications"],
        summary: "Update notification settings",
        description:
          "Updates the notification settings for the authenticated user",
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
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
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
