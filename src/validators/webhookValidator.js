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

module.exports = {
  webhookSchema,
};
