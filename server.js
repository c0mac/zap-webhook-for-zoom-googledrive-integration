const app = require("./src/app");

const PORT = process.env.PORT || 3000;

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
