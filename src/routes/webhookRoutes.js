const express = require("express");
const { processWebhook } = require("../controllers/webhookController");
const { webhookLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Webhook endpoint for Zapier
router.post("/", webhookLimiter, processWebhook);

module.exports = router;
