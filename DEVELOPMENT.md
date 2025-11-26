# Development Roadmap & Implementation Guide

## Current Status: Phase 1 ✅ COMPLETE

### What's Been Built
- ✅ Full Vite + React 19 + TypeScript project setup
- ✅ PWA configuration with Service Worker & Workbox
- ✅ Firebase initialization & configuration
- ✅ Authentication system (Email/Password + Google OAuth)
- ✅ Zustand state management stores
- ✅ Beautiful responsive UI (gradient theme)
- ✅ Environment variable configuration
- ✅ Production-ready build pipeline

### Code Quality
- ✅ TypeScript strict mode enabled
- ✅ ESLint configured
- ✅ No security vulnerabilities
- ✅ PWA best practices followed
- ✅ Responsive mobile-first design

---

## Phase 2: Real-time Chat System 🚀 NEXT

### Components to Build

#### 1. ChatRoom Component
```typescript
// src/components/ChatRoom.tsx
- Display room header (name, member count)
- Message list area (scrollable)
- Message input field
- File upload support
- Real-time updates
- Typing indicators
```

**Implementation Steps:**
```bash
# 1. Create component structure
touch src/components/ChatRoom.tsx

# 2. Implement Firestore listeners
# Use: subscribeToRoomMessages() from chatService

# 3. Add message input handling
# Use: sendMessage() from chatService

# 4. Implement UI
# CSS: src/styles/chat.css
```

#### 2. MessageList Component
```typescript
// src/components/MessageList.tsx
- Auto-scroll to latest message
- Message grouping by time
- User avatars
- Timestamp formatting
- Message reactions
- Edit/delete functionality
```

#### 3. RoomList Component
```typescript
// src/components/RoomList.tsx
- Display all rooms user is in
- Room preview (last message, timestamp)
- Unread message badge
- Create new room button
- Leave room option
```

#### 4. RoomCreation Component
```typescript
// src/components/RoomCreationForm.tsx
- Room name input
- Description textarea
- Private/Public toggle
- Location input (geolocation)
- Create button with validation
```

### Services to Enhance

**chatService.ts** - Already has:
- ✅ createChatRoom()
- ✅ getNearbyRooms()
- ✅ subscribeToRoomMessages()
- ✅ sendMessage()
- ✅ joinRoom()
- ✅ leaveRoom()

**New methods needed:**
- deleteMessage(messageId)
- editMessage(messageId, newText)
- addReaction(messageId, emoji)
- getTypingStatus(roomId)
- updateTypingStatus(roomId, isTyping)
- uploadAttachment(roomId, file)

### Firestore Updates

**New subcollections:**
```
messages/{messageId}/reactions/
  └── {userId}: emoji

rooms/{roomId}/members/
  └── {userId}: { joinedAt, lastRead }
```

**New fields:**
```
messages.edited: boolean
messages.editedAt?: timestamp
messages.deletedAt?: timestamp
messages.reactions?: map<emoji, count>
```

---

## Phase 3: Geolocation Discovery 📍

### Components

#### 1. LocationRequestComponent
```typescript
// src/components/LocationRequest.tsx
- Request user permission
- Show current location
- Enable/disable tracking
- Privacy notice
```

#### 2. MapView Component
```typescript
// src/components/MapView.tsx
- Display map of nearby rooms
- Room markers with click handlers
- User location pin
- Radius circle showing search area
- Search radius slider
```

#### 3. NearbyRoomsList Component
```typescript
// src/components/NearbyRoomsList.tsx
- Filtered list of nearby rooms
- Distance from user
- Member count & activity
- Join button
- Sorting: distance, members, activity
```

### Services

**New: geolocationService.ts**
```typescript
export const requestUserLocation: () => Promise<{lat, lng}>
export const watchUserLocation: (callback) => unsubscribe
export const calculateDistance: (lat1, lng1, lat2, lng2) => distance
export const filterRoomsByDistance: (rooms, userLoc, radius) => filtered
```

**Update: chatService.ts**
```typescript
export const updateUserLocation: (userId, lat, lng) => Promise<void>
export const getNearbyRooms: (lat, lng, radiusKm) => Promise<ChatRoom[]>
```

### Store Update: geolocationStore.ts
```typescript
interface GeolocationState {
  userLatitude: number | null;
  userLongitude: number | null;
  isTracking: boolean;
  searchRadius: number; // km
  nearbyRooms: ChatRoom[];
  setLocation: (lat, lng) => void;
  setTracking: (bool) => void;
  setSearchRadius: (radius) => void;
  setNearbyRooms: (rooms) => void;
}
```

### Security Considerations
- User can disable location tracking
- Location updates every 5 minutes (not real-time)
- Don't expose exact location in Firestore
- Use geohashing for efficient queries

---

## Phase 4: Stripe Payment Integration 💳

### Components

#### 1. SubscriptionPlans Component
```typescript
// src/components/SubscriptionPlans.tsx
- Display three plans: Free, Pro, Premium
- Feature list per plan
- Price display
- Subscribe button
- Current plan badge
```

#### 2. PaymentCheckout Component
```typescript
// src/components/PaymentCheckout.tsx
- Stripe CardElement
- Cardholder name input
- Billing address form
- Submit button
- Error handling
```

#### 3. SubscriptionManagement Component
```typescript
// src/components/SubscriptionManagement.tsx
- Current plan display
- Billing cycle info
- Update payment method
- Cancel subscription button
- Invoice history
```

### Services: stripeService.ts

```typescript
export const initStripe: () => Promise<Stripe>
export const createPaymentIntent: (amount, currency) => Promise<ClientSecret>
export const confirmCardPayment: (clientSecret, cardElement) => Promise<PaymentResult>
export const createSubscription: (customerId, priceId) => Promise<Subscription>
export const cancelSubscription: (subscriptionId) => Promise<void>
export const updatePaymentMethod: (customerId, paymentMethod) => Promise<void>
export const getSubscriptionStatus: (userId) => Promise<SubscriptionInfo>
export const getInvoices: (customerId) => Promise<Invoice[]>
```

### Cloud Functions

**functions/createStripeCustomer.ts**
```typescript
// Trigger: onCreate /users/{uid}
// Creates Stripe customer when user signs up
export const createStripeCustomer = functions.firestore
  .document('users/{uid}')
  .onCreate(async (snap, context) => {
    const user = snap.data();
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { firebaseUID: context.params.uid },
    });
    return admin.firestore()
      .collection('users')
      .doc(context.params.uid)
      .update({ stripeCustomerId: customer.id });
  });
```

**functions/handleStripeWebhook.ts**
```typescript
// Webhook endpoint: /api/webhooks/stripe
// Handles subscription events
export const handleStripeWebhook = functions.https.onRequest(
  async (req, res) => {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'customer.subscription.updated':
        // Update user subscription status
      case 'customer.subscription.deleted':
        // Mark subscription as canceled
      case 'invoice.payment_succeeded':
        // Log payment
    }
    res.json({ received: true });
  }
);
```

### Store: subscriptionStore.ts
```typescript
interface SubscriptionState {
  currentPlan: 'free' | 'pro' | 'premium';
  subscriptionStatus: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: Date | null;
  stripeCustomerId: string | null;
  paymentMethods: PaymentMethod[];
  setPlan: (plan) => void;
  setStatus: (status) => void;
  setPaymentMethods: (methods) => void;
}
```

### Environment Variables for Stripe
```env
# Frontend
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Backend (Cloud Functions)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Phase 5: Mobile & Polish 📱

### Performance Optimizations
- [ ] Code splitting by route
- [ ] Image lazy loading
- [ ] Dynamic imports for components
- [ ] Cache strategies tuning
- [ ] Minify CSS & JavaScript
- [ ] Compress images (WebP)

### Mobile Features
- [ ] Home screen icon
- [ ] Splash screen
- [ ] Full-screen mode
- [ ] Status bar styling
- [ ] Touch optimizations
- [ ] Keyboard handling

### Features
- [ ] Push notifications
- [ ] Offline message queue
- [ ] Background sync
- [ ] Notification badge
- [ ] Share functionality

---

## Implementation Timeline Estimate

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1 (Setup) | 2-3 hours | ✅ Complete |
| Phase 2 (Chat) | 4-5 hours | 🚀 Next |
| Phase 3 (Geolocation) | 3-4 hours | Planned |
| Phase 4 (Payments) | 4-6 hours | Planned |
| Phase 5 (Polish) | 3-4 hours | Planned |
| **Total** | **16-22 hours** | |

---

## Testing Strategy

### Unit Tests (Vitest)
```bash
npm install -D vitest @vitest/ui
```

Test files:
- `services/*.test.ts` - Service logic
- `store/*.test.ts` - State management
- `utils/*.test.ts` - Helper functions

### E2E Tests (Cypress)
```bash
npm install -D cypress
```

Test files:
- `cypress/e2e/auth.cy.ts` - Login/signup flow
- `cypress/e2e/chat.cy.ts` - Chat functionality
- `cypress/e2e/payments.cy.ts` - Stripe integration

### Manual Testing
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test PWA installation
- [ ] Test offline functionality
- [ ] Test with different connection speeds

---

## Security Checklist

- [ ] HTTPS enforced in production
- [ ] Firestore security rules tested
- [ ] API keys hidden in .env files
- [ ] Stripe webhook signature verification
- [ ] CSRF token validation
- [ ] SQL injection prevention (N/A - using Firestore)
- [ ] XSS protection (React escaping)
- [ ] Rate limiting on sensitive endpoints
- [ ] User data encryption at rest (Firebase)
- [ ] Sensitive data not logged

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse Score | 90+ | TBD |
| FCP | < 2.5s | TBD |
| LCP | < 4s | TBD |
| CLS | < 0.1 | TBD |
| TTI | < 3.8s | TBD |
| Bundle Size | < 300KB | 674KB* |

*Firebase SDK is large; optimization in Phase 2

---

## Recommended Next Commands

```bash
# Start development
npm run dev

# Test Firebase locally
firebase emulators:start

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## Resources for Each Phase

### Phase 2: Real-time Chat
- [Firestore Listeners](https://firebase.google.com/docs/firestore/query-data/listen)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [React Real-time Patterns](https://react.dev/learn/rendering-lists)

### Phase 3: Geolocation
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [Geohashing](https://en.wikipedia.org/wiki/Geohash)

### Phase 4: Stripe
- [Stripe React Integration](https://stripe.com/docs/stripe-js/react)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Firebase with Stripe](https://firebase.google.com/docs/firestore/solutions/stripe)

### Phase 5: Mobile
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [Mobile Performance](https://web.dev/performance/)
- [Service Worker Strategies](https://developers.google.com/web/tools/workbox/modules/workbox-strategies)

---

## Troubleshooting During Development

### Firestore Connection Issues
```bash
# Check credentials
firebase login
firebase projects:list

# Emulator in terminal 1
firebase emulators:start

# App in terminal 2
npm run dev
```

### Stripe Test Mode
Always use `pk_test_` and `sk_test_` keys in development.
Switch to live keys only in production.

### PWA Service Worker Issues
```javascript
// Unregister all service workers
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(r => r.unregister()))
```

---

## Questions to Answer Before Each Phase

### Before Phase 2
- [ ] Firebase project created with Firestore enabled?
- [ ] Test auth working in dev server?
- [ ] Can create and read test documents in Firestore?

### Before Phase 3
- [ ] Browser geolocation permission working?
- [ ] Haversine formula tested locally?
- [ ] Understood Firebase geohashing options?

### Before Phase 4
- [ ] Stripe test account created?
- [ ] Stripe API keys secured in .env?
- [ ] Webhook endpoint architecture planned?

### Before Phase 5
- [ ] All previous phases fully tested?
- [ ] Performance baseline measured?
- [ ] Mobile devices available for testing?

---

**Ready to build Phase 2? Let me know when you want to start!** 🚀
