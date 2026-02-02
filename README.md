# FamSchedule - AI-Powered Scheduling App

A modern, sleek scheduling application that blends social media with smart AI-powered schedule management.

## Features

### Core Functionality
- **Welcome Banner**: Personalized greeting with date and time-based messages
- **Smart Schedule Views**:
  - Daily Schedule with detailed event cards
  - Weekly Schedule with 7-day overview
  - Monthly Calendar view
- **Swipe Navigation**: Swipe left/right or use arrow keys to switch between views
- **Dark/Light Mode**: Accessible theme toggle in settings with smooth transitions
- **Notification Center**: Track notes, discussions, planning groups, and reminders
- **Settings Panel**: Customize theme, notifications, and AI optimization preferences

### UI/UX Highlights
- Modern, sleek design with gradient accents
- Fully responsive (Web, mobile-ready for iOS/Android)
- Touch gesture support for mobile devices
- Keyboard navigation support (arrow keys)
- Smooth transitions and animations
- Priority-based color coding for events
- Category icons for quick event identification
- AI-adjusted event indicators

## Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4
- **State Management**: React Context API
- **Gestures**: Native touch events
- **Mobile**: Capacitor 8 (iOS & Android support)
- **Hosting**: Vercel (Web)

## Getting Started

### Installation

```bash
npm install
```

### Development

#### Web Development
```bash
npm run dev
```

Visit `http://localhost:5173/` to view the app.

#### Mobile Development (iOS/Android)

First, build and sync the web assets to mobile platforms:
```bash
npm run build:mobile
```

Then open the native IDE:
```bash
# For Android (Android Studio)
npm run android

# For iOS (Xcode - requires macOS)
npm run ios
```

### Build

#### Web Build
```bash
npm run build
```

#### Mobile Build
```bash
# Build web assets and sync to native platforms
npm run build:mobile

# Sync changes to native platforms without rebuilding
npm run sync
```

### Preview Production Build

```bash
npm run preview
```

## Deployment

### Web Deployment (Vercel)

#### Option 1: Deploy with Vercel CLI
```bash
npm install -g vercel
vercel
```

#### Option 2: Deploy via GitHub
1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Vercel will auto-detect Vite and deploy

The app will be live at your Vercel URL (e.g., `https://your-app.vercel.app`)

### Mobile Deployment

#### Android
1. Open Android Studio: `npm run android`
2. Build APK: Build → Build Bundle(s) / APK(s) → Build APK(s)
3. Or build release: Build → Generate Signed Bundle / APK

#### iOS (requires macOS)
1. Open Xcode: `npm run ios`
2. Select a development team in Signing & Capabilities
3. Build and run on simulator or device
4. For App Store: Product → Archive

## Project Structure

```
src/
├── components/
│   ├── WelcomeBanner.tsx      # Personalized greeting banner
│   ├── Settings.tsx            # Settings modal with theme toggle
│   ├── DailySchedule.tsx       # Daily view with event cards
│   ├── WeeklySchedule.tsx      # 7-day overview
│   ├── MonthlySchedule.tsx     # Monthly calendar
│   └── NotificationCenter.tsx  # Notifications panel
├── context/
│   └── ThemeContext.tsx        # Light/Dark theme management
├── types/
│   └── index.ts                # TypeScript interfaces
├── utils/
│   └── mockData.ts             # Sample data for demo
├── App.tsx                     # Main application component
├── main.tsx                    # Application entry point
└── index.css                   # Global styles with Tailwind
```

## Key Features Explained

### Theme System
The app uses React Context for theme management with localStorage persistence. Toggle between light and dark modes through the settings panel.

### Schedule Views
- **Daily**: Detailed event cards with time, participants, categories, and priority levels
- **Weekly**: Compact 7-day view showing today highlighted and event counts per day
- **Monthly**: Full calendar month view with event indicators

### Swipe Gestures
- Swipe left: Move to next view (Daily → Weekly → Monthly)
- Swipe right: Move to previous view (Monthly → Weekly → Daily)
- Alternative: Use keyboard arrow keys

### Notifications
Track different types of notifications:
- 📝 Notes
- 💬 Discussions
- 📋 Planning groups
- ⏰ Reminders

Click any notification to mark as read.

### Event Categories
- 💼 Work
- 🏠 Personal
- 👥 Social
- 📅 Other

### Priority Levels
- High: Red border (important meetings, family time)
- Medium: Yellow border (social events, regular tasks)
- Low: Green border (optional activities)

## Future Enhancements

- Backend integration for real data
- AI scheduling optimization engine
- User authentication and profiles
- Social features (friend connections, shared calendars)
- Push notifications
- Calendar integrations (Google Calendar, Outlook)
- Native mobile apps (React Native conversion)
- Real-time collaboration features
- Smart conflict resolution
- Priority contact management
- Activity learning and suggestions

## Development Notes

This is a landing page prototype demonstrating the core UI/UX concepts. The application uses mock data and is designed to be easily extended with backend services and native mobile versions.

## License

MIT
