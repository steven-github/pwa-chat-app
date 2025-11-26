# PWA Chat App - Comprehensive Setup Guide

## Architecture Overview

### Technology Stack
- **Frontend**: React 19 + TypeScript + Vite
- **State Management**: Zustand
- **Backend**: Firebase (Auth, Firestore, Cloud Functions, Storage)
- **Payments**: Stripe (test mode)
- **PWA**: Service Worker + Workbox
- **Hosting**: Vercel/Netlify/Firebase Hosting (your choice)

---

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Name it: `pwa-chat-app`
4. Disable Analytics (for simplicity)
5. Create the project

### 1.2 Enable Authentication
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Enable **Google** (you'll need Google OAuth credentials)
4. For Google, you'll need:
   - Client ID
   - Client Secret
   - Authorized redirect URIs: `http://localhost:3000` and your production domain

### 1.3 Create Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **Test Mode** (for development)
4. Select region: `us-central1`

### 1.4 Enable Cloud Storage
1. Go to **Storage**
2. Click "Get started"
3. Keep default security rules for now

### 1.5 Get Firebase Config
1. Go to **Project Settings** → **Your apps**
2. Click the Web app registration
3. Copy the config object
4. Update `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Step 2: Firestore Database Schema

### Collections Structure

#### `users` Collection
```
users/{uid}
├── uid: string (document ID)
├── email: string
├── displayName: string
├── photoURL?: string
├── latitude?: number
├── longitude?: number
├── subscriptionStatus: 'free' | 'active' | 'canceled' | 'past_due'
├── subscriptionPlan?: string
├── stripeCustomerId?: string
├── createdAt: timestamp
├── lastLogin?: timestamp
└── updatedAt: timestamp
```

#### `rooms` Collection
```
rooms/{roomId}
├── id: string (document ID)
├── name: string
├── description: string
├── createdBy: string (userId)
├── createdAt: timestamp
├── memberCount: number
├── latitude: number (geolocation)
├── longitude: number (geolocation)
├── radius: number (discovery radius in km)
├── isPrivate: boolean
├── lastMessage?: timestamp
└── tags?: string[]
```

#### `messages` Collection
```
messages/{messageId}
├── id: string (document ID)
├── roomId: string (reference to rooms)
├── userId: string (reference to users)
├── userName: string
├── text: string
├── timestamp: timestamp
├── attachments?: string[] (storage URLs)
├── reactions?: map<userId, emoji>
└── edited?: boolean
```

#### `subscriptions` Collection
```
subscriptions/{userId}
├── userId: string (document ID)
├── stripeCustomerId: string
├── stripeSubscriptionId?: string
├── plan: 'free' | 'pro' | 'premium'
├── status: 'active' | 'canceled' | 'past_due'
├── currentPeriodStart?: timestamp
├── currentPeriodEnd?: timestamp
├── canceledAt?: timestamp
└── metadata?: map
```

#### `payments` Collection
```
payments/{paymentId}
├── paymentId: string (document ID)
├── userId: string
├── stripePaymentIntentId: string
├── amount: number (cents)
├── currency: string
├── status: 'succeeded' | 'processing' | 'failed'
├── description: string
├── createdAt: timestamp
└── metadata?: map
```

---

## Step 3: Firestore Security Rules

Update your Firestore Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth != null; // Others can see basic profile
    }
    
    // Rooms - readable by authenticated users, writable by creator
    match /rooms/{roomId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.createdBy;
      
      // Room members subcollection
      match /members/{userId} {
        allow read: if request.auth != null;
        allow write: if request.auth.uid == userId;
      }
    }
    
    // Messages - readable by authenticated, writable by author
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // Subscriptions - user can only read/write their own
    match /subscriptions/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Payments - user can only read their own
    match /payments/{paymentId} {
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## Step 4: Stripe Setup

### 4.1 Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create an account (test mode)
3. Get your API keys:
   - **Publishable Key**: `pk_test_...`
   - **Secret Key**: `sk_test_...`

### 4.2 Create Subscription Products
1. Go to **Products** → **Create a product**
2. Create three plans:
   - **Free** (default, no charge)
   - **Pro** ($9.99/month)
   - **Premium** ($29.99/month)

3. For each paid plan:
   - Set up recurring monthly billing
   - Note the **Price ID** (e.g., `price_1234567890abcdef`)

### 4.3 Webhook Setup
1. Go to **Developers** → **Webhooks**
2. Add endpoint for: `https://yourdomain.com/api/webhooks/stripe`
3. Listen for events:
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`

### 4.4 Update .env.local
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
VITE_STRIPE_SECRET_KEY=sk_test_your_key
```

---

## Step 5: Set Environment Variables

### Development (.env.local)
```bash
# Firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_SECRET_KEY=sk_test_...

# App
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:3000
```

### Production (.env.production)
```bash
# Firebase (production project)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Stripe (production keys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_STRIPE_SECRET_KEY=sk_live_...

# App
VITE_APP_ENV=production
VITE_API_BASE_URL=https://yourdomain.com
```

---

## Step 6: Run Development Server

```bash
cd pwa-chat-app

# Install dependencies (already done)
npm install

# Start dev server
npm run dev

# App will be available at http://localhost:5173
```

---

## Step 7: Build & Deploy

### Local Build Testing
```bash
npm run build
npm run preview
```

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
# Follow prompts and set environment variables
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli
netlify deploy --prod
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase deploy
```

---

## Key Features Implemented

✅ **PWA Support**
- Service Worker with Workbox
- Offline support
- App manifest
- Installable on mobile

✅ **Firebase Authentication**
- Email/Password signup
- Google OAuth login
- User profiles in Firestore

✅ **Real-time Chat** (Next Phase)
- Firestore listeners for messages
- Room creation & discovery
- Member management

✅ **Geolocation Discovery** (Next Phase)
- Haversine distance calculation
- Nearby rooms filtering
- Location-based room creation

✅ **Stripe Payments** (Next Phase)
- Subscription management
- Payment processing
- Webhook handling

---

## Next Steps

1. **Complete chat UI components**
   - ChatRoom component
   - MessageList component
   - MessageInput component
   - RoomList component

2. **Implement geolocation**
   - Get user location
   - Update location in Firestore
   - Filter nearby rooms

3. **Build Stripe integration**
   - Payment checkout flow
   - Subscription management
   - Plan upgrades/downgrades

4. **Cloud Functions** (Firestore, Cloud Messaging)
   - User onboarding
   - Notification sending
   - Subscription webhooks

5. **Performance optimization**
   - Image compression
   - Code splitting
   - Caching strategies

6. **Testing & Security**
   - Unit tests (Vitest)
   - E2E tests (Cypress)
   - Security audit

---

## Testing Stripe in Development

Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Failure**: `4000 0000 0000 0002`
- Any future date for expiration
- Any 3-digit CVC

---

## Troubleshooting

### Firebase Emulator (Optional)
For local development without internet:
```bash
npm install -g firebase-tools
firebase emulators:start
```

### Common Issues
1. **CORS errors**: Check Firebase project permissions
2. **Auth not working**: Verify OAuth credentials
3. **Firestore rules**: Check security rules in console

---

## Resources
- [Firebase Docs](https://firebase.google.com/docs)
- [Stripe API](https://stripe.com/docs/api)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app)
- [React Best Practices](https://react.dev)

