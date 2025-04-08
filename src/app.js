/**
 * Entry point for the Express server.
 * - Initializes Firebase and environment variables
 * - Sets up middleware for CORS and JSON parsing
 * - Registers routes
 * - Starts the server on the specified port
 */

import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import cors from "cors";
import { initFirebase } from "./loaders/firebase.js";
initFirebase();
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend app
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://appointment-scheduling-app-0507.netlify.app",
    ],
    credentials: true,
  })
);

// Parse incoming JSON requests
app.use(bodyParser.json());

// API routes
app.use("/api", appointmentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
