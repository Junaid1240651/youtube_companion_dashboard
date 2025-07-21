# YouTube Companion Dashboard Backend

This is the backend server for the YouTube Companion Dashboard project. It provides RESTful APIs for video details, comments, and notes, and handles Google OAuth authentication for secure access.

## Features
- Google OAuth2 authentication (only whitelisted emails can log in)
- YouTube Data API integration
- Notes and comments management
- Event logging
- CORS support for frontend deployment

## Prerequisites
- Node.js (v18 or higher recommended)
- npm
- MySQL database

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd youtube_companion_dashboard/youtube_companion_dashboard_backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in the required values:
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
     - `GOOGLE_REDIRECT_URI`
     - `FRONTEND_URL`
     - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

4. **Initialize the database:**
   - Run the SQL in `db/schema.sql` on your MySQL server.

5. **Start the backend server:**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

The server will run on the port specified in your `.env` file (default: 3000).

## Google OAuth Whitelisting
- **Important:** Only whitelisted Google accounts can log in via OAuth.
- If you are testing, use the provided test account:
  - Email: `companiondashboard00@gmail.com`
  - Password: `companion_dashboard0786`
- Other Gmail accounts will not work unless added to the OAuth consent screen's test users.

## API Endpoints

### Authentication & User Info
- `GET /auth/google` — Start Google OAuth login
- `GET /auth/google/callback` — Google OAuth callback
- `POST /auth/logout` — Logout and clear session
- `GET /api/userinfo` — Get current user info
- `GET /health` — Health check

### Video Endpoints
- `GET /api/videos/:videoId` — Get video details
- `PUT /api/videos/:videoId` — Update video title/description

### Comment Endpoints
- `GET /api/videos/:videoId/comments` — Get comments for a video
- `POST /api/videos/:videoId/comments` — Add a comment to a video
- `POST /api/videos/comments/:commentId/replies` — Add a reply to a comment
- `DELETE /api/videos/comments/:commentId` — Delete a comment
- `DELETE /api/videos/comments/:replyId/reply` — Delete a reply

### Notes Endpoints
- `GET /api/:videoId/notes` — Get all notes for a video
- `GET /api/:videoId/notes/category?category=...` — Get notes by category
- `GET /api/:videoId/notes/priority?priority=...` — Get notes by priority
- `POST /api/:videoId/notes` — Create a note for a video
- `GET /api/notes/:noteId` — Get a single note by ID
- `PUT /api/notes/:noteId` — Update a note
- `DELETE /api/notes/:noteId` — Delete a note
- `PATCH /api/notes/:noteId/toggle` — Toggle note completion

## CORS
- Only requests from the deployed frontend URLs are allowed (see `index.js` for allowed origins).

## License
MIT 