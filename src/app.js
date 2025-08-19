const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", routes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
