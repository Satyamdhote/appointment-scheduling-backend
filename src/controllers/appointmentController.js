import {
  createEvent,
  getEventsBetween,
  getFreeSlots,
  getConflictingEvents,
  getAllTimezones,
} from "../services/appointmentService.js";
import appConfig from "../config/appConfig.js";
import moment from "moment-timezone";
import { ApiError } from "../utils/apiError.js";

/**
 * Get free slots for a given date and timezone
 */
export const getFreeSlotsController = async (req, res, next) => {
  try {
    let { date, timezone } = req.query;
    timezone = timezone || appConfig.DEFAULT_TIMEZONE;

    if (!date) {
      throw new ApiError(400, "Date is required");
    }

    // Validate date format
    if (!moment(date, "YYYY-MM-DD", true).isValid()) {
      throw new ApiError(400, "Invalid date format. Please use YYYY-MM-DD");
    }

    // Validate timezone
    if (!moment.tz.zone(timezone)) {
      throw new ApiError(400, "Invalid timezone");
    }

    const freeSlots = await getFreeSlots(date, timezone);
    res.status(200).json(freeSlots);
  } catch (error) {
    console.error("Error getting free slots:", error);
    next(error);
  }
};

/**
 * Create a new event
 */
export const createEventController = async (req, res, next) => {
  try {
    const { dateTime, duration } = req.body;

    if (!dateTime || !duration) {
      throw new ApiError(400, "DateTime and duration are required");
    }

    // Parse and validate dateTime
    const parsedDateTime = new Date(dateTime);
    if (isNaN(parsedDateTime.getTime())) {
      throw new ApiError(400, "Invalid dateTime format");
    }

    // Validate duration
    if (isNaN(duration) || duration <= 0) {
      throw new ApiError(400, "Duration must be a positive number");
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
      throw new ApiError(400, "Event must be within working hours");
    }

    // Store event in UTC
    const utcDateTime = moment
      .tz(dateTime, appConfig.DEFAULT_TIMEZONE)
      .utc()
      .toDate();

    // Check for overlapping events
    const isBooked = await getConflictingEvents(utcDateTime, duration);
    if (isBooked) {
      throw new ApiError(422, "This time slot is already booked");
    }

    const createdEvent = await createEvent(utcDateTime, duration);
    res.status(200).json({ success: true, event: createdEvent });
  } catch (error) {
    next(error);
  }
};

/**
 * Get events between start and end dates
 */
export const getEventsController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new ApiError(400, "StartDate and EndDate are required");
    }

    // Parse dates in the application's default timezone
    const parsedStartDate = moment.tz(startDate, appConfig.DEFAULT_TIMEZONE);
    const parsedEndDate = moment.tz(endDate, appConfig.DEFAULT_TIMEZONE);

    if (!parsedStartDate.isValid() || !parsedEndDate.isValid()) {
      throw new ApiError(400, "Invalid date format");
    }

    // Ensure startDate is before endDate
    if (parsedStartDate > parsedEndDate) {
      throw new ApiError(400, "StartDate must be before EndDate");
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
    next(error);
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
    next(error);
  }
};
