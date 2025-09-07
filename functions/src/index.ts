import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import express from "express";

// Configure global options
setGlobalOptions({maxInstances: 10});

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Simple health check endpoint
app.get("/api/health", (req, res) => {
  res.json({status: "ok", message: "SistemaV API is running"});
});

// Placeholder for other API routes
app.get("/api/*", (req, res) => {
  res.json({message: "API endpoint not implemented yet"});
});

// Serve static files (frontend)
app.use(express.static("../../dist/public"));

// Catch-all handler for SPA
app.get("*", (req, res) => {
  res.sendFile("index.html", {root: "../../dist/public"});
});

// Export the Express app as a Firebase Function
export const api = onRequest(app);
