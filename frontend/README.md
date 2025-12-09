# Notes Application - Frontend

A modern Next.js frontend application for managing notes with authentication, built with TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

### 🔐 Authentication System
- **Login Page** (`/login`) - User authentication with email and password
- **Register Page** (`/register`) - New user registration
- **JWT Token Management** - Automatic token refresh and secure storage
- **Protected Routes** - Automatic redirect for unauthenticated users

### 📊 Dashboard (`/dashboard`)
- **Statistics Widgets**
  - Total notes count
  - Notes created this week
  - Active alerts counter
- **Recent Activity** - Display of 5 most recent notes with color coding
- **Real-time Updates** - Live data from your backend API

### 📝 Notes Management (`/notes`)
- **Create Notes** - Modal form with title, content, and color selection
- **Delete Notes** - One-click delete with confirmation
- **Advanced Filters**
  - Search by title or content
  - Filter by color (Blue, Green, Red, Yellow, Purple, Pink)
  - Filter by date (Today, This Week, This Month, All Time)
- **Data Table** - Sortable table with color indicators

### 🚨 Alerts Viewer (`/alerts`)
- **Alert Types** - Error, Warning, Info, Success
- **Severity Indicators** - Color-coded badges and icons
- **Alert Management**
  - Mark as resolved
  - Dismiss alerts
  - Separate views for resolved/unresolved
- **Statistics Dashboard** - Overview of alert counts

### 🎨 UI/UX Features
- **Sidebar Navigation** - Easy access to all pages
- **Dark Mode Support** - Built-in theme switching
- **Responsive Design** - Mobile-friendly layouts
- **Loading States** - Skeleton loaders for better UX
- **Error Handling** - User-friendly error messages

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **State Management**: React Context API
- **HTTP Client**: Fetch API with automatic token refresh

## Prerequisites

- Node.js 18+ or Bun
- Backend API running on `http://localhost:8080` (or configure in `.env.local`)

## Installation

1. **Install dependencies**:
```bash
bun install
# or
npm install
```

2. **Configure environment variables**:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` to set your API base URL:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

3. **Run the development server**:
```bash
bun dev
# or
npm run dev
```

4. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints Expected

The frontend expects the following API endpoints from your backend:

### Authentication
- `POST /auth/register` - Register new user
  ```json
  Request: { "email": "user@example.com", "password": "password123" }
  Response: { "accessToken": "jwt-token", "refreshToken": "refresh-token" }
  ```

- `POST /auth/login` - Login user
  ```json
  Request: { "email": "user@example.com", "password": "password123" }
  Response: { "accessToken": "jwt-token", "refreshToken": "refresh-token" }
  ```

- `POST /auth/refresh` - Refresh access token
  ```json
  Request: { "refreshToken": "refresh-token" }
  Response: { "accessToken": "new-jwt-token", "refreshToken": "new-refresh-token" }
  ```

### Notes
- `GET /notes?ownerId={userId}` - Get all notes for a user
  ```json
  Response: [
    {
      "id": "note-id",
      "title": "Note Title",
      "content": "Note content",
      "color": 3947254,
      "createdAt": "2024-01-01T00:00:00Z",
      "ownerId": "user-id"
    }
  ]
  ```

- `POST /notes` - Create a new note
  ```json
  Request: {
    "title": "New Note",
    "content": "Note content",
    "color": 3947254,
    "ownerId": "user-id"
  }
  Response: { "id": "note-id", ... }
  ```

- `DELETE /notes/{id}` - Delete a note
  ```
  Response: 204 No Content
  ```

## JWT Token Format

The application expects JWT tokens with the following payload structure:
```json
{
  "userId": "user-id",  // or "sub"
  "email": "user@example.com",
  "exp": 1234567890,
  "iat": 1234567890
}
```

## Project Structure

```
src/
├── app/
│   ├── alerts/         # Alerts viewer page
│   ├── dashboard/      # Dashboard with widgets
│   ├── login/          # Login page
│   ├── notes/          # Notes management page
│   ├── register/       # Registration page
│   ├── layout.tsx      # Root layout with AuthProvider
│   └── page.tsx        # Home page (redirects)
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── ProtectedRoute.tsx  # Auth guard component
│   └── Sidebar.tsx     # Navigation sidebar
├── contexts/
│   └── AuthContext.tsx # Authentication state management
├── lib/
│   ├── api.ts          # API client with auto token refresh
│   ├── auth.ts         # Authentication service
│   └── config.ts       # App configuration
└── types/
    └── index.ts        # TypeScript type definitions
```

## Usage Guide

### 1. First Time Setup
1. Start your backend API server on `http://localhost:8080`
2. Start the frontend development server
3. Navigate to `http://localhost:3000`
4. Click "Register" to create a new account

### 2. Creating Notes
1. Log in to your account
2. Navigate to "Notes" in the sidebar
3. Click "Create Note" button
4. Fill in the title, content, and select a color
5. Click "Create Note" to save

### 3. Managing Notes
- **Search**: Use the search bar to filter by title or content
- **Filter by Color**: Use the color dropdown to filter notes
- **Filter by Date**: Use the date dropdown to see recent notes
- **Delete**: Click the trash icon on any note row

### 4. Viewing Dashboard
- Navigate to "Dashboard" to see statistics
- View total notes, weekly activity, and recent notes
- Check active alerts count

### 5. Managing Alerts
- Navigate to "Alerts" to view system notifications
- Mark alerts as resolved with the checkmark button
- Dismiss alerts with the X button
- View resolved alerts in the separate section

## Customization

### Change API URL
Edit `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

### Add New Colors
Edit `src/app/notes/page.tsx`, add to the `colors` array:
```typescript
const colors = [
  { label: 'Blue', value: '3b82f6' },
  { label: 'Orange', value: 'f97316' }, // Add your color
];
```

### Modify Theme
Edit `src/app/globals.css` to customize colors and styles.

## Security Features

- **JWT Token Storage**: Tokens stored in localStorage with automatic cleanup
- **Automatic Token Refresh**: Expired tokens are automatically refreshed
- **Protected Routes**: Unauthenticated users redirected to login
- **Authorization Headers**: All API requests include Bearer token
- **Secure Logout**: Clears all tokens and redirects to login

## Troubleshooting

### Issue: "Failed to fetch notes"
- Ensure backend API is running
- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Verify CORS is enabled on your backend

### Issue: "Token refresh failed"
- Backend `/auth/refresh` endpoint may not be working
- Check refresh token expiry settings
- Try logging out and logging back in

### Issue: Notes not showing
- Check browser console for API errors
- Verify `ownerId` matches the logged-in user's ID
- Ensure JWT token includes `userId` or `sub` field

## Development

```bash
# Run development server
bun dev

# Build for production
bun run build

# Start production server
bun start

# Run linter
bun run lint
```

## License

MIT