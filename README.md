# MentorLink

A terminal-based mentorship and career guidance platform. Two roles — **mentor**
and **mentee** — register, log in, and interact entirely through a CLI menu
system backed by a real Node.js application layer and MongoDB.

## Stack

```
Terminal (readline)
      │
Node.js (ES modules)
      │
Application layer (services)
      │
MongoDB (Mongoose)
```

No frontend framework — the terminal *is* the UI.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your own `.env` from the template and fill in your MongoDB Atlas
   connection string (never commit this file — it's already gitignored):

   ```bash
   cp .env.example .env
   ```

   Edit `.env`:

   ```
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/mentorlink?retryWrites=true&w=majority
   ```

3. Run it:

   ```bash
   npm start
   ```

## Project structure

```
src/
├── index.js                 Entry point — connects DB, runs the main menu loop
├── config/db.js              Mongoose connection
├── models/                   Mongoose schemas (User, MentorProfile, MenteeProfile,
│                              Availability, Booking, Message, Resource)
├── services/                 Business logic, no I/O with the terminal
│   ├── authService.js         register/login, bcrypt hashing
│   ├── mentorService.js       mentor profile CRUD, ratings, session counts
│   ├── menteeService.js       mentee profile CRUD
│   ├── availabilityService.js availability slots + overlap prevention
│   ├── bookingService.js      booking creation, conflict detection, slot suggestions
│   ├── matchingService.js     weighted mentor recommendation score
│   └── sessionService.js      chat messages + shared resources
├── cli/
│   ├── io.js                  readline wrapper (ask/askPassword/askNumber)
│   ├── ui.js                  banner, menus, colored output helpers
│   └── screens/                one file per screen (register, login, dashboards,
│                                mentor browsing, availability, booking, session
│                                room, chat, history)
└── utils/                     constants, time-interval math, validators
```

## What's implemented

- **Auth** — registration and login for both roles, bcrypt-hashed passwords.
- **Mentor profiles** — title, skills, industry, experience, goals, languages,
  bio, rolling rating and completed-session count.
- **Smart matching** — mentee profile (skill interest, experience level,
  industry, goal) scored against every mentor: skill 40% + industry 25% +
  goal 20% + experience 15%, ranked highest first.
- **Availability** — mentors set weekly day/time windows; overlapping windows
  for the same day are rejected.
- **Booking engine** — a slot must fall inside the mentor's availability *and*
  not overlap an existing pending/confirmed booking; on conflict it returns
  the specific clashing time and up to three real alternative slots computed
  from the mentor's actual free time.
- **Booking lifecycle** — pending → confirmed/rejected → completed, mentor
  accept/reject/cancel, mentee cancel, today's-sessions view (matched against
  the real current weekday).
- **Session room** — meeting-link placeholder, in-session chat persisted per
  booking, resource sharing (link/GitHub/document/course), end session.
- **History & feedback** — completed sessions with message/resource counts;
  mentee can rate 1–5 and leave a comment, which feeds the mentor's rating.

## What's next (per your phase plan)

- Phase 8: broader edge-case/error-handling pass, possibly an automated test
  suite (the service layer was verified with a 20-check integration script
  during development — happy to formalize that into `npm test` if useful).
- Phase 9: documentation polish, GitHub push, viva prep notes.

## Notes

- Passwords are masked with `*` when run in a real terminal (TTY); if input
  is ever piped/redirected, it falls back to plain input.
- Booking days are recurring weekdays (e.g. "Monday"), not calendar dates —
  matching the scheduling model in the spec. "Today's Sessions" compares
  against the actual current weekday via `dayjs()`.
