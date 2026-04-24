// @ts-nocheck
require('dotenv').config();

const PORT = parseInt(process.env.PORT || "5000", 10);

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

// Graceful shutdown for Render's SIGTERM
process.on("SIGTERM", () => {
  console.log("SIGTERM received — shutting down gracefully");
  process.exit(0);
});

console.log(`Starting server on port ${PORT}...`);
console.log(`DATABASE_URL set: ${!!process.env.DATABASE_URL}`);
console.log(`JWT_SECRET set: ${!!process.env.JWT_SECRET}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

// Self-ping every 14 minutes to prevent Render free tier from sleeping
if (process.env.NODE_ENV === "production" && process.env.RENDER_EXTERNAL_URL) {
  const selfUrl = `${process.env.RENDER_EXTERNAL_URL}/api/v1/health`;
  setInterval(() => {
    const https = require("https");
    https.get(selfUrl, (res) => {
      console.log(`[Keep-alive] ping ${selfUrl} → ${res.statusCode}`);
    }).on("error", (err) => {
      console.warn(`[Keep-alive] ping failed: ${err.message}`);
    });
  }, 14 * 60 * 1000); // every 14 minutes
}

// Load the main app
require('./index');
