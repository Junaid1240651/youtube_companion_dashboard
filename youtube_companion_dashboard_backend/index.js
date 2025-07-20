import dotenv from "dotenv";
dotenv.config();
import fs from 'fs';
import express from "express";
import https from 'https';
import cors from "cors";
import { dbConnection } from "./db/connection.js";
import { google } from 'googleapis';
import EventLogger from './services/eventLogger.js';

// Route imports
import videoRoutes from "./routes/videoRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";

const app = express();
const port = process.env.PORT || 3000;
const con = dbConnection();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);

// --- Google OAuth2 Setup ---
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
console.log(oauth2Client);

const OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

// Persistent token store
let oauthTokens = null;
const TOKEN_PATH = 'google_oauth_tokens.json';

// Load tokens from file on server start
try {
  if (fs.existsSync(TOKEN_PATH)) {
    oauthTokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    oauth2Client.setCredentials(oauthTokens);
  }
} catch (e) {
  console.error('Failed to load OAuth tokens:', e);
}

// Listen for token refresh and update file
oauth2Client.on('tokens', (tokens) => {
  if (tokens.refresh_token) {
    oauthTokens = tokens;
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  }
});

// Route: Start OAuth2 flow
app.get('/auth/google', (req, res) => {
  console.log('[OAuth] /auth/google - Received request');
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: OAUTH_SCOPES,
    prompt: 'consent',
  });
  console.log('[OAuth] /auth/google - Redirecting to:', url);
  res.redirect(url);
});

// Route: OAuth2 callback
app.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;
  console.log('[OAuth] /auth/google/callback - Received request with code:', code);
  if (!code) {
    console.log('[OAuth] /auth/google/callback - No code provided');
    return res.redirect('http://localhost:3001/?error=NoCodeProvided');
  }
  try {
    console.log('[OAuth] /auth/google/callback - Exchanging code for tokens...');
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    oauthTokens = tokens;
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log('[OAuth] /auth/google/callback - Token exchange successful. Tokens saved to file.');
    // Log the login event
    await EventLogger.logEvent({
      eventType: 'auth',
      eventAction: 'GET',
      eventMessage: 'login',
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection?.remoteAddress,
      requestData: {
        method: req.method,
        url: req.url
      },
      status: 'success'
    });
    console.log('[OAuth] /auth/google/callback - Redirecting to frontend.');
    res.redirect(process.env.FRONTEND_URL);
  } catch (err) {
    console.log('[OAuth] /auth/google/callback - Error during token exchange:', err);
    res.redirect('http://localhost:3001/?error=OAuthError');
  }
});

// Add logout endpoint
app.post('/auth/logout', async (req, res) => {
  console.log('[Auth] /auth/logout - Received logout request');
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      fs.unlinkSync(TOKEN_PATH);
      console.log('[Auth] /auth/logout - Token file deleted');
    }
    oauthTokens = null;
    // Log the logout event
    await EventLogger.logEvent({
      eventType: 'auth',
      eventAction: 'POST',
      eventMessage: 'logout',
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection?.remoteAddress,
      requestData: {
        method: req.method,
        url: req.url
      },
      status: 'success'
    });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.log('[Auth] /auth/logout - Error during logout:', err);
    res.status(500).json({ success: false, message: 'Logout failed', error: err.message });
  }
});

// Routes
app.use('/api/videos', videoRoutes);
app.use('/api', noteRoutes);

// User info endpoint for frontend login state
app.get('/api/userinfo', async (req, res) => {
  console.log('[UserInfo] /api/userinfo - Received request');
  if (!oauthTokens) {
    console.log('[UserInfo] /api/userinfo - Not logged in (no tokens)');
    return res.status(401).json({ error: 'Not logged in' });
  }
  try {
    oauth2Client.setCredentials(oauthTokens);
    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();
    console.log('[UserInfo] /api/userinfo - User info fetched:', userInfo.data);
    res.json({
      name: userInfo.data.name,
      avatarUrl: userInfo.data.picture,
      email: userInfo.data.email
    });
  } catch (err) {
    console.log('[UserInfo] /api/userinfo - Error fetching user info:', err);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'YouTube Companion Dashboard API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "An unexpected error occurred", error: err.message });
});

// Start server
app.listen(port, () => {
console.log(`Server is running on port ${port}`);
});
// https.createServer(options, app).listen(port, () => {
//     console.log(`Secure server running at ${port}`);
// });

// Export for use in YouTubeService
export { oauth2Client, oauthTokens };
