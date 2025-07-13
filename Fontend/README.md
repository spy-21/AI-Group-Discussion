# AI Group Discussion Platform - Frontend

A React-based frontend for the AI Group Discussion Platform that enables real-time group discussions with AI participants.

## Features

- **Session Management**: Create and join discussion sessions
- **Real-time Communication**: Audio-based discussions with WebRTC
- **AI Participants**: Intelligent AI assistants that contribute to discussions
- **Participant Management**: Track and manage session participants
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Session Analytics**: Post-discussion analysis and insights

## Tech Stack

- **React 19** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Socket.io Client** - Real-time communication (to be implemented)

## Project Structure

```
src/
├── components/          # React components
│   ├── HomePage.jsx     # Landing page
│   ├── SessionCreator.jsx # Create new sessions
│   ├── JoinSession.jsx  # Join existing sessions
│   ├── SessionRoom.jsx  # Main discussion room
│   └── ParticipantList.jsx # Participant management
├── context/             # React context providers
│   └── SessionContext.jsx # Session state management
├── hooks/               # Custom React hooks
│   └── useSession.js    # Session management hook
├── api/                 # API utilities
│   └── api.js          # API endpoints and configuration
├── App.jsx             # Main app component
└── main.jsx            # App entry point
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
# Create .env file in the root directory
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Components Overview

### HomePage
Landing page with navigation to create or join sessions. Features:
- Modern, responsive design
- Feature highlights
- Quick action buttons

### SessionCreator
Form to create new discussion sessions. Features:
- Topic and description input
- Duration and participant limits
- AI participant configuration
- Scheduling options

### JoinSession
Interface to join existing sessions. Features:
- Session code input
- User name entry
- Validation and error handling

### SessionRoom
Main discussion interface. Features:
- Real-time audio controls
- Participant list sidebar
- Session timer
- Recording functionality
- Discussion controls

### ParticipantList
Sidebar component showing all participants. Features:
- Participant status indicators
- AI vs human participant distinction
- Speaking indicators
- Audio status

## State Management

The app uses React Context for global state management:

- **SessionContext**: Manages session data, participants, and connection status
- **useSession Hook**: Provides session management functions with API integration

## API Integration

The frontend communicates with the backend through RESTful APIs:

- **Session Management**: Create, join, update, and leave sessions
- **User Management**: Authentication and profile management
- **AI Integration**: AI response generation and conversation analysis
- **WebRTC**: Signaling and ICE server configuration

## Styling

The app uses Tailwind CSS for styling:
- Responsive design
- Modern UI components
- Consistent color scheme
- Smooth animations and transitions

## Development Guidelines

1. **Component Structure**: Use functional components with hooks
2. **State Management**: Use Context for global state, local state for component-specific data
3. **API Calls**: Use the provided API utilities in `src/api/api.js`
4. **Styling**: Use Tailwind classes for consistent styling
5. **Error Handling**: Implement proper error boundaries and user feedback

## Future Enhancements

- WebRTC audio implementation
- Socket.io real-time updates
- AI participant integration
- Session recording and playback
- Advanced analytics dashboard
- Multi-language support
- Accessibility improvements

## Contributing

1. Follow the existing code structure
2. Use meaningful component and variable names
3. Add proper error handling
4. Test components thoroughly
5. Update documentation as needed

## License

This project is part of the AI Group Discussion Platform internship project. 