# 🚀 Quick Reference - Firestore Setup

## Single Command Setup
```bash
./setup.sh
```

## Initialize Collections (Pick 1)

### 1️⃣ Button Click (Easiest)
- Log in to app
- Click floating button: "Initialize Collections"
- ✅ Done!

### 2️⃣ Browser Console
```javascript
import { firebaseInit } from '/src/utils/firestoreSetup.js'
import { db } from '/src/config/firebase.js'
await firebaseInit(db)
```

### 3️⃣ In App Code
```typescript
import { firebaseInit } from './utils/firestoreSetup'
import { db } from './config/firebase'

await firebaseInit(db)
```

## What Gets Created
- ✅ users (user profiles)
- ✅ rooms (chat rooms with location)
- ✅ messages (chat messages)
- ✅ subscriptions (billing info)
- ✅ payments (payment history)

## Firebase Setup (3 Steps)
1. Create project: [console.firebase.google.com](https://console.firebase.google.com)
2. Enable: Firestore + Auth (Email/Password)
3. Copy credentials to `.env.local`

## Next: Update Security Rules
→ Copy from `FIRESTORE_SETUP.md` to Firebase Console

## Files Added/Changed
```
NEW:  src/utils/firestoreSetup.ts
NEW:  src/components/FirestoreSetup.tsx
NEW:  FIRESTORE_SETUP.md (complete guide)
NEW:  setup.sh (auto-setup script)
EDIT: README.md (quick start section)
```

## Development
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production
```

## Troubleshooting
- Collections not visible? → They appear after first document created
- Permission errors? → Update Firestore Security Rules
- Env vars not loading? → Restart: `npm run dev`

---

**Need help?** → See `FIRESTORE_SETUP.md` for detailed guide
