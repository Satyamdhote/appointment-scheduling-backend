/**
 * Central configuration for the appointment booking app.
 * Defines core scheduling parameters such as working hours,
 * slot duration, default timezone, and Firestore collection name.
 */

const appConfig = {
  START_HOUR: 10, // Start of working day (10 AM)
  END_HOUR: 17, // End of working day (5 PM)
  SLOT_DURATION: 30, // Duration of each appointment slot in minutes
  DEFAULT_TIMEZONE: "US/Eastern", // Default timezone for scheduling
  COLLECTION_NAME: "events", // Firestore collection name for storing events
};

export default appConfig;
