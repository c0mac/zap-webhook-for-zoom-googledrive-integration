/**
 * Generate a random request ID for tracking
 * @returns {string} Random request ID
 */
const generateRequestId = () => {
  return Math.random().toString(36).substring(7);
};

/**
 * Get appropriate error message based on HTTP status code
 * @param {number} statusCode - HTTP status code
 * @returns {string} Error message
 */
const getErrorMessage = (statusCode) => {
  const errorMessages = {
    401: "Invalid access token",
    403: "Insufficient permissions to access recordings",
    404: "User not found or no recordings available",
    408: "Request timeout",
    429: "Zoom API rate limit exceeded",
    503: "Zoom API service unavailable",
    500: "Internal server error",
  };

  return errorMessages[statusCode] || "An unexpected error occurred";
};

/**
 * Get appropriate HTTP status code based on error type
 * @param {Error} error - Error object
 * @returns {number} HTTP status code
 */
const getErrorStatusCode = (error) => {
  if (error.name === "AbortError" || error.code === "ECONNABORTED") {
    return 408;
  }
  if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
    return 503;
  }
  return 500;
};

/**
 * Sanitize and encode parameters for safe API calls
 * @param {string} value - Value to sanitize
 * @returns {string} Sanitized value
 */
const sanitizeParameter = (value) => {
  return encodeURIComponent(value.trim());
};

module.exports = {
  generateRequestId,
  getErrorMessage,
  getErrorStatusCode,
  sanitizeParameter,
};
