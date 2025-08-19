const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Validation schema for webhook parameters
const Joi = require("joi");

const webhookSchema = Joi.object({
  user_id: Joi.string().required().min(1).max(100),
  from: Joi.string().isoDate().required(),
  to: Joi.string().isoDate().required(),
  access_token: Joi.string().required().min(1),
}).custom((value, helpers) => {
  // Validate date range
  const fromDate = new Date(value.from);
  const toDate = new Date(value.to);
  const now = new Date();

  if (fromDate > toDate) {
    return helpers.error("any.invalid", {
      message: "from date must be before to date",
    });
  }

  if (toDate > now) {
    return helpers.error("any.invalid", {
      message: "to date cannot be in the future",
    });
  }

  // Limit date range to 90 days
  const daysDiff = (toDate - fromDate) / (1000 * 60 * 60 * 24);
  if (daysDiff > 90) {
    return helpers.error("any.invalid", {
      message: "date range cannot exceed 90 days",
    });
  }

  return value;
});

// Rate limiting configuration
const rateLimit = require("express-rate-limit");

const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Webhook endpoint for Zapier
app.post("/webhook", webhookLimiter, async (req, res) => {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  try {
    console.log(
      `[${requestId}] Webhook received:`,
      JSON.stringify(req.body, null, 2)
    );

    // Validate the incoming data
    const { error, value } = webhookSchema.validate(req.body);

    if (error) {
      console.error(`[${requestId}] Validation error:`, error.details);
      return res.status(400).json({
        success: false,
        error: "Invalid parameters",
        details: error.details.map((detail) => detail.message),
        requestId,
      });
    }

    const { user_id, from, to, access_token } = value;

    // Sanitize and encode parameters
    const sanitizedUserId = encodeURIComponent(user_id.trim());
    const sanitizedFrom = encodeURIComponent(from);
    const sanitizedTo = encodeURIComponent(to);

    const url = `https://api.zoom.us/v2/users/${sanitizedUserId}/recordings?from=${sanitizedFrom}&to=${sanitizedTo}`;

    console.log(`[${requestId}] Fetching recordings from Zoom API...`);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "User-Agent": "Zoom-Google-Drive-Webhook/1.0.0",
        Accept: "application/json",
      },
      timeout: 30000, // 30 second timeout
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(
        `[${requestId}] Zoom API error:`,
        response.status,
        errorData
      );

      let errorMessage = "Failed to fetch recordings from Zoom API";
      if (response.status === 401) {
        errorMessage = "Invalid access token";
      } else if (response.status === 403) {
        errorMessage = "Insufficient permissions to access recordings";
      } else if (response.status === 404) {
        errorMessage = "User not found or no recordings available";
      } else if (response.status === 429) {
        errorMessage = "Zoom API rate limit exceeded";
      }

      return res.status(response.status).json({
        success: false,
        error: errorMessage,
        statusCode: response.status,
        requestId,
      });
    }

    const data = await response.json();
    const processingTime = Date.now() - startTime;

    console.log(
      `[${requestId}] Successfully fetched recordings in ${processingTime}ms`
    );

    // Validate Zoom API response
    if (!data || typeof data !== "object") {
      throw new Error("Invalid response format from Zoom API");
    }

    // Return success response with metadata
    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
      data: data,
      metadata: {
        requestId,
        processingTime: `${processingTime}ms`,
        timestamp: new Date().toISOString(),
        user_id: sanitizedUserId,
        dateRange: {
          from: sanitizedFrom,
          to: sanitizedTo,
        },
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[${requestId}] Webhook processing error:`, error);

    // Determine appropriate error response
    let statusCode = 500;
    let errorMessage = "Internal server error";

    if (error.name === "AbortError" || error.code === "ECONNABORTED") {
      statusCode = 408;
      errorMessage = "Request timeout";
    } else if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      statusCode = 503;
      errorMessage = "Zoom API service unavailable";
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "An unexpected error occurred",
      requestId,
      processingTime: `${processingTime}ms`,
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Zoom Google Drive Webhook API",
    version: "1.0.0",
    endpoints: {
      webhook: "POST /webhook",
      health: "GET /health",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Export for Vercel serverless functions
module.exports = app;

// Only start the server if this file is run directly (for local development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Webhook endpoint: http://localhost:${PORT}/webhook`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  });
}
