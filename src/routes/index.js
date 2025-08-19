const express = require("express");
const webhookRoutes = require("./webhookRoutes");
const { getHealth, getRoot } = require("../controllers/healthController");

const router = express.Router();

// Health check endpoint
router.get("/health", getHealth);

// Root endpoint
router.get("/", getRoot);

// Webhook routes
router.use("/webhook", webhookRoutes);

module.exports = router;
