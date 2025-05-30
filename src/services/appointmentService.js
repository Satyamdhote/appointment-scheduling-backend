import config from "../config/appConfig.js";
import { generateSlots } from "../utils/timezoneHelper.js";
import moment from "moment-timezone";
import appConfig from "../config/appConfig.js";
import { getDB } from "../db/index.js";

/**
 * Fetch events that occur between two dates
 */
export const getEventsBetween = async (startDate, endDate) => {
  const db = getDB();

  const snapshot = await db
    .collection(config.COLLECTION_NAME)
    .where("start", ">=", startDate)
    .where("start", "<=", endDate)
    .get();

  if (snapshot.empty) {
    return [];
  }

  // Map each document to a plain JS object, converting Firestore timestamps
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      start: data.start.toDate().toISOString(),
      createdAt: data.createdAt.toDate().toISOString(),
    };
  });
};

/**
 * Generate and return available time slots for a given date and timezone
 */
export const getFreeSlots = async (
  date,
  timezone = appConfig.DEFAULT_TIMEZONE
) => {
  const allSlots = generateSlots(
    date,
    config.START_HOUR,
    config.END_HOUR,
    config.SLOT_DURATION,
    appConfig.DEFAULT_TIMEZONE
  );

  const startOfDay = moment.tz(date, timezone).startOf("day").toDate();
  const endOfDay = moment.tz(date, timezone).endOf("day").toDate();

  const events = await getEventsBetween(startOfDay, endOfDay);

  // Normalize booked slots to UTC for accurate overlap comparison
  const bookedSlots = events.map((event) => {
    const start = moment(
      event.start.toDate ? event.start.toDate() : event.start
    );
    const end = start.clone().add(event.duration, "minutes");
    return { start: start.utc(), end: end.utc() };
  });

  // Filter out overlapping slots
  const availableSlots = allSlots.filter((slot) => {
    const slotStart = moment.utc(slot);
    const slotEnd = slotStart.clone().add(config.SLOT_DURATION, "minutes");

    // Check if this slot overlaps with any booked range
    const isOverlapping = bookedSlots.some(
      (event) => slotStart < event.end && slotEnd > event.start
    );

    return !isOverlapping;
  });

  return availableSlots;
};

/**
 * Check if a new event would conflict with existing events
 */
export const getConflictingEvents = async (dateTime, duration) => {
  const db = getDB();

  const startDateTime = new Date(dateTime);
  const endDateTime = new Date(startDateTime.getTime());
  endDateTime.setMinutes(endDateTime.getMinutes() + Number(duration));

  // Get all events that could potentially conflict
  const snapshot = await db.collection(config.COLLECTION_NAME).get();

  if (snapshot.empty) {
    return false;
  }

  // Check each event for overlap
  for (const doc of snapshot.docs) {
    const data = doc.data();

    // Get start date - handle both Firebase Timestamp and Date formats
    const eventStart = data.start.toDate
      ? data.start.toDate()
      : new Date(data.start);
    const eventDuration = Number(data.duration);
    const eventEnd = new Date(eventStart.getTime() + eventDuration * 60000);

    // Check for time overlap - the standard formula
    if (startDateTime < eventEnd && endDateTime > eventStart) {
      return true;
    }
  }

  return false;
};

/**
 * Create a new event in the database
 */
export const createEvent = async (start, duration) => {
  const db = getDB();

  const docRef = await db.collection(config.COLLECTION_NAME).add({
    start: new Date(start),
    duration: Number(duration),
    createdAt: new Date(),
  });

  const snapshot = await docRef.get();

  return {
    id: docRef.id,
    ...snapshot.data(),
  };
};

/**
 * Get a list of all supported timezones
 */
export const getAllTimezones = () => {
  return moment.tz.names();
};
