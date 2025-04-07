/**
 * Initializes the Firebase Admin SDK using a service account key.
 * Ensures initialization occurs only once, even if called multiple times.
 */

import admin from "firebase-admin";
import { createRequire } from "module";
import { initializeDB } from "../db/index.js";
const require = createRequire(import.meta.url);
const serviceAccount = require("../../serviceAccountKey.json");

export const initFirebase = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase initialized");

    // Initialize the database connection
    initializeDB();
  }
  return admin;
};
