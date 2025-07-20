# YouTube Companion Dashboard

A modern React-based dashboard for managing YouTube videos and engaging with your audience. Built with Material-UI (MUI) for a beautiful and responsive user interface.

## Features

### 🎥 Video Management
- **Video Details Display**: View comprehensive information about your uploaded video
- **Edit Video Metadata**: Update video title and description with inline editing
- **Video Statistics**: View counts, likes, comments, and publication date
- **Status Indicator**: Shows video privacy status (unlisted, public, private)

### 💬 Comment Management
- **Add Comments**: Post new comments on your video
- **Reply to Comments**: Respond to viewer comments with threaded replies
- **Delete Comments**: Remove your own comments and replies
- **Comment Threading**: View comments with their replies in a nested structure
- **Real-time Updates**: See comment counts and engagement metrics

### 🎨 User Interface
- **Modern Design**: Clean, professional interface using Material-UI components
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Interactive Elements**: Hover effects, loading states, and smooth animations
- **Accessibility**: Built with accessibility best practices in mind

### 📱 Key Components
- **Video Card**: Displays video thumbnail, title, stats, and description
- **Comments Panel**: Sidebar with comment management functionality
- **Edit Dialogs**: Inline editing for title and description
- **Reply Dialog**: Modal for adding replies to comments
- **Alert System**: Success/error notifications for user actions

## Technology Stack

- **React 19**: Latest React version with hooks and functional components
- **Material-UI (MUI)**: Comprehensive UI component library
- **Emotion**: CSS-in-JS styling solution
- **React Icons**: Material Design icons from MUI

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd youtube_companion_dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── App.js              # Main application component
├── App.css             # Custom styles for the dashboard
├── index.js            # Application entry point
├── index.css           # Global styles
└── components/         # (Future: Reusable components)
```

## Features in Detail

### Video Information Display
- **Thumbnail**: High-quality video preview image
- **Title**: Editable video title with inline editing
- **Description**: Multi-line description with edit functionality
- **Statistics**: View count, like count, comment count
- **Metadata**: Publication date and video duration
- **Status**: Privacy status indicator (unlisted/public/private)

### Comment System
- **Comment List**: Chronological display of all comments
- **User Avatars**: Visual representation of comment authors
- **Timestamps**: When comments were posted
- **Reply Threading**: Nested replies under parent comments
- **Action Buttons**: Reply and delete options for user comments
- **Real-time Counts**: Live comment count updates

### Editing Capabilities
- **Inline Title Editing**: Click edit icon to modify video title
- **Description Editor**: Multi-line text area for video description
- **Save/Cancel Actions**: Confirm or discard changes
- **Loading States**: Visual feedback during save operations
- **Success Notifications**: Alert messages for successful updates

## Future Enhancements

### Backend Integration
- **YouTube API Integration**: Connect to actual YouTube Data API v3
- **Authentication**: OAuth 2.0 for YouTube account access
- **Real-time Updates**: WebSocket connections for live data
- **Data Persistence**: Save user preferences and settings

### Additional Features
- **Video Upload**: Direct video upload functionality
- **Analytics Dashboard**: Detailed video performance metrics
- **Comment Moderation**: Advanced comment management tools
- **Bulk Operations**: Mass edit/delete capabilities
- **Export Features**: Download video data and comments
- **Multi-video Support**: Manage multiple videos from one dashboard

### UI/UX Improvements
- **Dark Mode**: Toggle between light and dark themes
- **Customization**: User-configurable dashboard layout
- **Keyboard Shortcuts**: Power user navigation options
- **Mobile App**: React Native version for mobile devices

## API Integration Notes

This frontend is designed to work with the YouTube Data API v3. Key endpoints that would be integrated:

- `videos.list` - Fetch video details
- `videos.update` - Update video metadata
- `commentThreads.list` - Get video comments
- `comments.insert` - Add new comments
- `comments.update` - Edit existing comments
- `comments.delete` - Remove comments

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Material-UI team for the excellent component library
- YouTube Data API for providing the backend services
- React team for the amazing framework
- Create React App for the development setup
