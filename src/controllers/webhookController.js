const { webhookSchema } = require("../validators/webhookValidator");
const {
  generateRequestId,
  getErrorMessage,
  getErrorStatusCode,
  sanitizeParameter,
} = require("../utils/helpers");

/**
 * Process webhook request to fetch Zoom recordings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processWebhook = async (req, res) => {
  const requestId = generateRequestId();
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
    const sanitizedUserId = sanitizeParameter(user_id);
    const sanitizedFrom = sanitizeParameter(from);
    const sanitizedTo = sanitizeParameter(to);

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

      const errorMessage = getErrorMessage(response.status);

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
      // metadata: {
      //   requestId,
      //   processingTime: `${processingTime}ms`,
      //   timestamp: new Date().toISOString(),
      //   user_id: sanitizedUserId,
      //   dateRange: {
      //     from: sanitizedFrom,
      //     to: sanitizedTo,
      //   },
      // },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[${requestId}] Webhook processing error:`, error);

    // Determine appropriate error response
    const statusCode = getErrorStatusCode(error);
    const errorMessage = getErrorMessage(statusCode);

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
};

module.exports = {
  processWebhook,
};
