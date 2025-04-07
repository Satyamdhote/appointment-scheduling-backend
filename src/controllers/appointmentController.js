import {
  createEvent,
  getEventsBetween,
  getFreeSlots,
  getConflictingEvents,
  getAllTimezones,
} from "../services/appointmentService.js";
import appConfig from "../config/appConfig.js";
import moment from "moment-timezone";

/**
 * Get free slots for a given date and timezone
 */
export const getFreeSlotsController = async (req, res) => {
  try {
    let { date, timezone } = req.query;
    timezone = timezone || appConfig.DEFAULT_TIMEZONE;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    // Validate date format
    if (!moment(date, "YYYY-MM-DD", true).isValid()) {
      return res
        .status(400)
        .json({ error: "Invalid date format. Please use YYYY-MM-DD" });
    }

    // Validate timezone
    if (!moment.tz.zone(timezone)) {
      return res.status(400).json({ error: "Invalid timezone" });
    }

    const freeSlots = await getFreeSlots(date, timezone);
    res.status(200).json(freeSlots);
  } catch (error) {
    console.error("Error getting free slots:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new event
 */
export const createEventController = async (req, res) => {
  try {
    const { dateTime, duration } = req.body;

    if (!dateTime || !duration) {
      return res
        .status(400)
        .json({ error: "DateTime and duration are required" });
    }

    // Parse and validate dateTime
    const parsedDateTime = new Date(dateTime);
    if (isNaN(parsedDateTime.getTime())) {
      return res.status(400).json({ error: "Invalid dateTime format" });
    }

    // Validate duration
    if (isNaN(duration) || duration <= 0) {
      return res
        .status(400)
        .json({ error: "Duration must be a positive number" });
    }

    const startMoment = moment.tz(dateTime, appConfig.DEFAULT_TIMEZONE);
    const endMoment = startMoment.clone().add(duration, "minutes");

    // Define working hours window
    const workingDayStart = startMoment
      .clone()
      .hour(appConfig.START_HOUR)
      .minute(0)
      .second(0);
    const workingDayEnd = startMoment
      .clone()
      .hour(appConfig.END_HOUR)
      .minute(0)
      .second(0);

    // Ensure event starts and ends within working hours
    if (
      startMoment.isBefore(workingDayStart) ||
      endMoment.isAfter(workingDayEnd)
    ) {
      return res
        .status(400)
        .json({ error: "Event must be within working hours" });
    }

    // Check for overlapping events
    const isBooked = await getConflictingEvents(parsedDateTime, duration);
    if (isBooked) {
      return res
        .status(422)
        .json({ error: "This time slot is already booked" });
    }

    // Store event in UTC
    const utcDateTime = moment
      .tz(dateTime, appConfig.DEFAULT_TIMEZONE)
      .utc()
      .toDate();

    const createdEvent = await createEvent(utcDateTime, duration);
    res.status(200).json({ success: true, event: createdEvent });
  } catch (error) {
    res.status(422).json({ error: error.message });
  }
};

/**
 * Get events between start and end dates
 */
export const getEventsController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "StartDate and EndDate are required" });
    }

    // Parse dates in the application's default timezone
    const parsedStartDate = moment.tz(startDate, appConfig.DEFAULT_TIMEZONE);
    const parsedEndDate = moment.tz(endDate, appConfig.DEFAULT_TIMEZONE);

    if (!parsedStartDate.isValid() || !parsedEndDate.isValid()) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Ensure startDate is before endDate
    if (parsedStartDate > parsedEndDate) {
      return res
        .status(400)
        .json({ error: "StartDate must be before EndDate" });
    }

    // Create full day range in UTC to match how events are stored
    const startOfDay = parsedStartDate.clone().startOf("day").utc().toDate();
    const endOfDay = parsedEndDate.clone().endOf("day").utc().toDate();

    const events = await getEventsBetween(startOfDay, endOfDay);

    // Convert the events' times back to the requested timezone for the response
    const formattedEvents = events.map((event) => ({
      ...event,
      localTime: moment
        .utc(event.start)
        .tz(appConfig.DEFAULT_TIMEZONE)
        .format(),
    }));

    res.status(200).json(formattedEvents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get supported timezones
 */
export const fetchTimezones = async (req, res) => {
  try {
    const timezones = getAllTimezones();
    res.status(200).json(timezones);
  } catch (error) {
    console.error("Error fetching timezones:", error.message);
    res.status(500).json({ error: "Failed to fetch timezones" });
  }
};
