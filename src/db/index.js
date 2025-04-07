/**
 * Handles initialization and access to the Firestore database instance.
 * Ensures that Firestore is only initialized once after Firebase has been set up.
 */

import admin from "firebase-admin";

// Private variable to hold the db instance
let dbInstance = null;

// Initialize the database connection
export const initializeDB = () => {
  if (!admin.apps.length) {
    throw new Error("Firebase not initialized");
  }

  if (!dbInstance) {
    dbInstance = admin.firestore();

    if (!dbInstance || typeof dbInstance.collection !== "function") {
      throw new Error("Firestore not initialized properly");
    }
  }

  return dbInstance;
};

// Get the database instance
export const getDB = () => {
  if (!dbInstance) {
    return initializeDB();
  }
  return dbInstance;
};
