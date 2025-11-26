# 🚀 Firestore Initialization Guide

## Quick Start (3 Steps)

### Step 1: Create Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click "Add Project"
3. Name it `pwa-chat-app` (or your choice)
4. Accept defaults and click "Create"

### Step 2: Enable Services
1. **Firestore Database**: Click "Create Database" → Test Mode → Next → Create
2. **Authentication**: Go to "Authentication" → "Get Started" → Enable "Email/Password"
3. **Optionally**: Enable "Google" for OAuth

### Step 3: Get Credentials
1. Project Settings (⚙️ icon)
2. Scroll to "Your Apps" → Click `</>` (Firebase SDK snippet)
3. Copy the `firebaseConfig` object
4. Fill in `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Auto-Create Collections (Pick One Method)

### Method 1: One-Click Button (Recommended)
```tsx
// In your App.tsx, after user logs in:
import { FirestoreSetup } from './components/FirestoreSetup'

export default function App() {
  const { user } = useAuthStore();

  return (
    <>
      {/* Your app components */}
      {user && <FirestoreSetup autoCleanup={true} />}
    </>
  );
}
```

✅ Shows a floating button to create collections with one click
✅ Auto-deletes example documents after setup
✅ Shows status messages

---

### Method 2: Browser Console (Advanced)
```javascript
// 1. Open DevTools (F12)
// 2. Go to Console tab
// 3. Paste this:

import { firebaseInit } from '/src/utils/firestoreSetup.js'
import { db } from '/src/config/firebase.js'
await firebaseInit(db)

// 4. Watch the magic happen! ✨
```

---

### Method 3: Programmatic (Custom)
```tsx
import { firebaseInit, cleanupExamples } from './utils/firestoreSetup'
import { db } from './config/firebase'

// Create collections
await firebaseInit(db)

// Later, delete example documents:
await cleanupExamples(db)
```

---

## What Gets Created?

| Collection | Purpose | Example Doc |
|-----------|---------|------------|
| `users` | User profiles & settings | `email`, `displayName`, `subscriptionStatus` |
| `rooms` | Chat rooms with location | `name`, `latitude`, `longitude`, `memberCount` |
| `messages` | Chat messages | `text`, `userId`, `timestamp` |
| `subscriptions` | Subscription plans | `plan`, `status`, `createdAt` |
| `payments` | Payment history | `amount`, `status`, `timestamp` |

**All example documents have ID `__example__` and can be deleted anytime.**

---

## Security Rules Setup

After creating collections, update your Firestore Security Rules:

1. Go to Firestore Database → Rules
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Allow authenticated users to create/read rooms
    match /rooms/{roomId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if resource.data.createdBy == request.auth.uid;
    }

    // Allow authenticated users to write messages to rooms they're in
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Subscriptions
    match /subscriptions/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if false; // Only server should write
    }

    // Payments
    match /payments/{paymentId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow write: if false; // Only server should write
    }
  }
}
```

3. Click "Publish"

---

## Troubleshooting

### "Collections don't appear in Firebase Console"
- Collections only appear after first document is created
- Check if your environment variables are correct
- Check browser console for errors (F12)

### "Permission denied" errors
- Make sure you're logged in to the app
- Update Security Rules (see above)
- Check that `request.auth != null` works in your rules

### "Environment variables not loading"
- Make sure `.env.local` exists in project root
- Restart dev server: `npm run dev`
- Variables must start with `VITE_` to be exposed to frontend

---

## Next Steps

✅ Collections created → Go to Phase 2: Build Chat UI
- See `DEVELOPMENT.md` for Phase 2 roadmap
- Components to build: ChatRoom, MessageList, RoomList
- Estimated time: 4-5 hours

---

## Files Reference

- 📄 `src/utils/firestoreSetup.ts` - Collection initialization functions
- 📄 `src/components/FirestoreSetup.tsx` - One-click UI component
- 📄 `src/config/firebase.ts` - Firebase configuration
- 📄 `.env.example` - Environment variables template
