# SmartLock System Frontend

A modern, responsive web application for managing multiple smart locks built with Vue 3, Vite, and Bulma CSS.

## Features

- 🔐 **Real-time Lock Control** - Lock/unlock devices instantly
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🔔 **Live Notifications** - Real-time status updates and alerts
- 👥 **User Management** - Role-based access control
- 📊 **Dashboard Analytics** - System overview and statistics
- 🎨 **Modern UI** - Glass morphism design with smooth animations
- ⚡ **Fast Performance** - Optimized with Vite and code splitting

## Demo Credentials

- **Username:** admin
- **Password:** admin

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Fast build tool and dev server
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Bulma CSS** - Modern CSS framework
- **FontAwesome** - Icon library
- **Vue Toastification** - Toast notifications
- **Date-fns** - Date utility library

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── locks/          # Lock management components
│   ├── users/          # User management components
│   └── common/         # Shared components
├── views/              # Page components
├── stores/             # Pinia stores
├── router/             # Vue Router configuration
└── assets/             # Static assets and styles
```

## Mock Data

The application includes realistic mock data for demonstration:

- 4 sample smart locks with different statuses
- Real-time status simulation
- Battery level monitoring
- Activity logging
- User management system

## Features Demonstrated

### Dashboard
- System statistics overview
- Quick action buttons
- Recent activity display
- Real-time status updates

### Lock Management
- Individual lock cards with status
- Lock/unlock controls
- Battery level indicators
- Filtering and sorting options

### User Management
- User list with roles
- Permission management
- Activity tracking

### Settings
- Profile management
- Notification preferences
- System information

## Responsive Design

The application is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

The project uses modern development practices:
- ES6+ JavaScript
- Composition API
- TypeScript-ready
- Hot module replacement
- Code splitting
- Tree shaking

## Deployment

Build the project for production:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.
