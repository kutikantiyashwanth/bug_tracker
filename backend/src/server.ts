// @ts-nocheck
// Simple wrapper that ensures server starts even if there are errors
require('dotenv').config();

const PORT = parseInt(process.env.PORT || "5000", 10);

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

console.log(`Starting server on port ${PORT}...`);
console.log(`DATABASE_URL set: ${!!process.env.DATABASE_URL}`);
console.log(`JWT_SECRET set: ${!!process.env.JWT_SECRET}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

// Load the main app
require('./index');
