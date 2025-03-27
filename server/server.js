// server.js - Main Express server setup
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet()); // Helps secure Express apps with various HTTP headers
app.use(morgan("dev")); // HTTP request logger
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Static files for video content
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection setup
const db = require("./config/db.config");
// Test database connection
db.authenticate()
  .then(() => console.log("Database connection established successfully."))
  .catch((err) => console.error("Unable to connect to the database:", err));

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/techniques", require("./routes/technique.routes"));
app.use("/api/admin", require("./routes/admin.routes"));

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Workshop Honolulu BJJ API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export app for testing
module.exports = app;
