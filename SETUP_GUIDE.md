# PS Rent Pro - Setup & Features Guide

## 🎮 Overview
PS Rent Pro is a complete PlayStation rental management system with user authentication, profile management, dark mode, membership tiers, and database connectivity.

## ✨ New Features Added

### 1. **User Authentication**
- Sign up and sign in functionality
- Secure password-based authentication
- Persistent sessions across page reloads
- Protected routes requiring authentication

### 2. **Profile Management**
- User profile with customizable name and avatar
- Email display (read-only)
- Membership tier badges (Free, Premium, VIP)
- Profile updates sync to database in real-time

### 3. **Dark Mode**
- Toggle dark/light theme
- Syncs across all devices
- Persists in database
- Smooth theme transitions
- Fully accessible dark mode implementation

### 4. **Membership System**
- **Free Tier**: Basic features
  - Reserve up to 2 consoles per day
  - Standard rental rates
  - Basic notifications

- **Premium Tier** ($9.99/month):
  - Reserve up to 5 consoles per day
  - 10% discount on all rentals
  - Priority booking
  - Advanced notifications
  - Extended rental periods

- **VIP Tier** ($19.99/month):
  - Unlimited console reservations
  - 20% discount on all rentals
  - Exclusive VIP-only consoles
  - Free 1-hour extension per rental
  - 24/7 priority support
  - Early access to new releases

### 5. **Notification Preferences**
- Enable/disable all notifications
- Email notifications toggle
- Push notifications toggle
- Rental reminder settings
- All synced to database

### 6. **Database Integration**
- Supabase backend with PostgreSQL
- Real-time data synchronization
- Secure API endpoints
- User data persistence
- Settings stored per user

## 🚀 How to Run the Application

### Step 1: Prerequisites
Make sure you have installed:
- Node.js (v16 or higher)
- VS Code (or any code editor)
- npm, pnpm, or yarn

### Step 2: Install Dependencies
```bash
npm install
# OR
pnpm install
```

### Step 3: Start Development Server
```bash
npm run dev
# OR
pnpm dev
```

### Step 4: Access the Application
Open your browser and navigate to:
```
http://localhost:5173/
```

## 📱 Using the Application

### First Time Setup

1. **Visit the Auth Page**
   - Navigate to `/auth` or click "Sign In" in the header
   - You'll see tabs for "Sign In" and "Sign Up"

2. **Create an Account**
   - Click the "Sign Up" tab
   - Enter your full name, email, and password
   - Password must be at least 6 characters
   - Click "Create Account"

3. **Automatic Sign In**
   - After successful signup, you'll be automatically signed in
   - Redirected to the dashboard

### Accessing Settings

#### Method 1: Profile Menu
1. Click your avatar in the top-right corner
2. Select "Settings" from the dropdown menu

#### Method 2: Direct Navigation
1. Navigate to `/settings` in the URL

### Settings Pages

#### Profile Tab
- **Change Avatar**: Upload a profile picture (JPG, PNG, or GIF)
- **Update Name**: Edit your display name
- **View Email**: Your email is displayed (cannot be changed)
- **Membership Badge**: Shows your current membership tier
- **Save Button**: Click to save any profile changes

#### Preferences Tab
- **Dark Mode Toggle**: 
  - Enable/disable dark theme
  - Changes apply immediately
  - Syncs to database automatically
  
- **Notifications Section**:
  - Master notification toggle
  - Email notifications switch
  - Push notifications switch
  - Rental reminder toggle
  - All settings persist to database

#### Membership Tab
- **Current Plan**: Displays your active membership tier
- **Plan Cards**: View features of each tier
  - Free Plan (default)
  - Premium Plan ($9.99/month)
  - VIP Plan ($19.99/month)
- **Upgrade Buttons**: Click to upgrade to Premium or VIP
- **Real-time Updates**: Membership changes reflect immediately

### Using Dark Mode

1. Navigate to **Settings → Preferences Tab**
2. Toggle the **Dark Mode** switch
3. The theme changes instantly across the entire app
4. Your preference is saved to the database
5. Dark mode persists across:
   - Page refreshes
   - Different browsers
   - Different devices (when signed in)

### Managing Profile

1. Go to **Settings → Profile Tab**
2. **Change Your Name**:
   - Edit the "Full Name" field
   - Click "Save Changes"
   - Success notification appears
3. **Upload Avatar**:
   - Click "Change Photo" button
   - Select an image (max 2MB)
   - Avatar updates across all pages

### Upgrading Membership

1. Navigate to **Settings → Membership Tab**
2. Review the features of each plan
3. Click **"Upgrade to Premium"** or **"Upgrade to VIP"**
4. Your membership tier updates instantly
5. Enjoy new benefits immediately:
   - Discount badges on rentals
   - Increased reservation limits
   - Priority features

## 🔐 Authentication Flow

### Sign Up Process
```
User fills form → Backend creates user → 
Profile & settings created → Auto sign in → 
Redirect to dashboard
```

### Sign In Process
```
User enters credentials → Supabase authenticates → 
Fetch profile & settings → Apply dark mode → 
Show dashboard
```

### Sign Out Process
```
User clicks sign out → Clear session → 
Clear profile & settings → Remove dark mode → 
Redirect to /auth
```

## 🗄️ Database Structure

### User Profile (`user_profile:userId`)
```json
{
  "userId": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "url or null",
  "membershipTier": "free | premium | vip",
  "membershipStatus": "active",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

### User Settings (`user_settings:userId`)
```json
{
  "userId": "uuid",
  "darkMode": false,
  "notificationsEnabled": true,
  "emailNotifications": true,
  "pushNotifications": false,
  "rentalReminders": true,
  "updatedAt": "ISO timestamp"
}
```

## 🎨 UI Components

### Profile Menu (Header)
- Avatar with membership color ring
- Dropdown with user info
- Quick access to settings
- Sign out option

### Settings Navigation
- Tabbed interface
- Three main sections
- Responsive design
- Mobile-friendly

### Membership Cards
- Visual tier comparison
- Feature lists
- Pricing display
- Upgrade buttons
- Current plan indicators

## 🌙 Dark Mode Implementation

### How It Works
1. User toggles dark mode in settings
2. Setting saved to database via API
3. `dark` class added/removed from `<html>`
4. CSS variables automatically adjust colors
5. All components respect dark mode

### CSS Variables
- Light mode: White backgrounds, dark text
- Dark mode: Slate backgrounds (#0f172a), light text
- Smooth transitions between themes

## 🔔 Notification System

### Types of Notifications
1. **Toast Notifications**: Real-time feedback
2. **Email Notifications**: Sent to user's email
3. **Push Notifications**: Browser notifications
4. **Rental Reminders**: Alerts before rental ends

### Notification Settings
- Global toggle to enable/disable all
- Individual toggles for each type
- Settings persist in database
- Instant apply when changed

## 🛡️ Security Features

- Secure authentication via Supabase
- Password hashing (handled by Supabase)
- Session-based access control
- Protected API routes
- User data isolation
- Email confirmation ready

## 📊 API Endpoints

### Authentication
- `POST /auth/signup` - Create new user
- Sign in handled by Supabase client

### Profile
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

### Settings
- `GET /settings` - Get user settings
- `PUT /settings` - Update user settings

### Membership
- `POST /membership/upgrade` - Upgrade membership tier

## 🎯 Next Steps

After setting up, you can:
1. Create your account
2. Explore dark mode
3. Try different membership tiers
4. Customize your profile
5. Set notification preferences
6. Start making console reservations

## 🐛 Troubleshooting

### Issue: Can't sign in
- Clear browser cache
- Check console for errors
- Verify Supabase is connected

### Issue: Dark mode not persisting
- Ensure you're signed in
- Check that settings are saving (look for success toast)
- Try refreshing the page

### Issue: Avatar not uploading
- Check file size (max 2MB)
- Ensure file format is JPG, PNG, or GIF
- Check browser console for errors

## 💡 Tips

1. **Keyboard Navigation**: All settings are keyboard accessible
2. **Screen Readers**: Full ARIA support for accessibility
3. **Mobile First**: Optimized for mobile devices
4. **Responsive**: Works on all screen sizes
5. **Fast**: Real-time updates with minimal lag

---

**Enjoy your PS Rent Pro experience!** 🎮✨
