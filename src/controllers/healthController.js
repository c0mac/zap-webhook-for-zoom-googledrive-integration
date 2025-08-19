/**
 * Health check endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getHealth = (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

/**
 * Root endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRoot = (req, res) => {
  res.json({
    message: "Zoom Google Drive Webhook API",
    version: "1.0.0",
    endpoints: {
      webhook: "POST /webhook",
      health: "GET /health",
    },
  });
};

module.exports = {
  getHealth,
  getRoot,
};
