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
  user_id: Joi.string().required(),
  from: Joi.string().isoDate().required(),
  to: Joi.string().isoDate().required(),
  access_token: Joi.string().required(),
});

// Webhook endpoint for Zapier
app.post("/webhook", async (req, res) => {
  try {
    console.log("Webhook received:", JSON.stringify(req.body, null, 2));

    // Validate the incoming data
    const { error, value } = webhookSchema.validate(req.body);

    if (error) {
      console.error("Validation error:", error.details);
      return res.status(400).json({
        success: false,
        error: "Invalid parameters",
        details: error.details.map((detail) => detail.message),
      });
    }

    const { user_id, from, to, access_token } = value;

    // Log the validated parameters
    console.log("Validated parameters:");
    console.log("- User ID:", user_id);
    console.log("- From:", from);
    console.log("- To:", to);
    console.log("- Access Token:", access_token.substring(0, 20) + "...");

    // TODO: Add your business logic here
    // For example:
    // - Validate the access token
    // - Fetch data from Zoom API using the date range
    // - Process the data
    // - Store or forward to Google Drive

    // Simulate some processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return success response
    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
      data: {
        user_id,
        from,
        to,
        processed_at: new Date().toISOString(),
        records_processed: Math.floor(Math.random() * 100) + 1, // Mock data
      },
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
