# Dr. John's Appointment Booking System

A calendar appointment booking system built with Node.js, Express.js, and Firebase Firestore. This application allows users to see Dr. John's free time slots and book appointments.

## Features

- Backend API for managing appointments
- View free time slots based on availability configuration
- Book appointments in available time slots
- View existing appointments in a date range
- Timezone conversion support

## Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** Firebase Firestore
- **Date/Time Handling:** Moment.js, Moment Timezone
- **Date Picker:** Flatpickr

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Firebase project with Firestore enabled

## Setup and Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/appointment-booking-system.git
   cd appointment-booking-system
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file

   ```
   cp .env.example .env
   ```

4. Add a serviceAccountKey.json file at the root of the folder and add the json value with your Firebase service account JSON

5. Start the development server:

   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Configuration

The application uses the following static configuration values (located in `src/config/appConfig.js`):

- `START_HOURS`: Start time of availability (24-hour format, default: 10 AM)
- `END_HOURS`: End time of availability (24-hour format, default: 5 PM)
- `DURATION`: Duration of each slot in minutes (default: 30 minutes)
- `DEFAULT_TIMEZONE`: Default timezone (default: 'US/Eastern')
- `COLLECTION_NAME`: Default ccollection name (default: 'events')

## API Endpoints

### Get Free Slots

```
GET /api/free-slots?date=YYYY-MM-DD&timezone=US/Eastern
```

Returns all available time slots for a given date in the specified timezone.

### Create Event

```
POST /api/events
```

Creates a new event. Requires `dateTime` and `duration` in the request body.

### Get Events

```
GET /api/events?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

Returns all events between the given start and end dates.

### Get Timezones

```
GET /api/timezones
```

Returns the list of supported timezones.

## Author

[Satyam Dhote]
