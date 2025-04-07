/**
 * Utility functions for working with timezones and generating time slots.
 * Uses moment-timezone to handle accurate time conversions between UTC and local timezones.
 */
import moment from "moment-timezone";

/**
 * Converts a UTC datetime string to the specified timezone.
 */
export const convertToTimezone = (dateTime, timezone) =>
  moment.utc(dateTime).tz(timezone).format();

/**
 * Converts a datetime from a given timezone to UTC format.
 */
export const toUtc = (dateTime, timezone) =>
  moment.tz(dateTime, timezone).utc().format();

/**
 * Generates a list of UTC time slots for a given date and timezone.
 * Each slot is of specified duration (in minutes) between start and end hours.
 */
export const generateSlots = (date, startHour, endHour, duration, timezone) => {
  const slots = [];
  const start = moment.tz(date, timezone).hour(startHour).minute(0).second(0);
  const end = moment.tz(date, timezone).hour(endHour).minute(0).second(0);

  // Generate slots in UTC
  while (start < end) {
    slots.push(start.clone().utc().format());
    start.add(duration, "minutes");
  }
  return slots;
};
