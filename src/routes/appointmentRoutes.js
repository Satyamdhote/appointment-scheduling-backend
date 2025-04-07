import express from "express";
import {
  getFreeSlotsController,
  createEventController,
  getEventsController,
  fetchTimezones,
} from "../controllers/appointmentController.js";

const router = express.Router();
// Get free slots
router.get("/free-slots", getFreeSlotsController);

// Create a new event
router.post("/events", createEventController);

// Get events by date range
router.get("/events", getEventsController);

// Get supported timezones
router.get("/timezones", fetchTimezones);

export default router;
