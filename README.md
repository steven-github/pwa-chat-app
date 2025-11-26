# PWA Chat App - Real-time Geolocation Chat with Subscriptions

A high-performance Progressive Web App (PWA) featuring real-time chat, geolocation-based room discovery, and Stripe subscription management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ with npm
- Firebase account (free tier works)
- Stripe account (test mode)
- Modern web browser with PWA support

### Installation

```bash
# Navigate to project
cd pwa-chat-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase and Stripe keys

# Start development server
npm run dev
```

Visit `http://localhost:5173` and the app will auto-reload on changes.

## 📋 Project Structure

```
pwa-chat-app/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Layout.tsx       # Main layout wrapper
│   │   ├── AuthForm.tsx     # Authentication UI
│   │   └── ...
│   ├── services/            # Business logic & API calls
│   │   ├── authService.ts   # Firebase authentication
│   │   ├── chatService.ts   # Firestore chat operations
│   │   └── ...
│   ├── store/               # Zustand state management
│   │   ├── authStore.ts     # Auth state
│   │   └── chatStore.ts     # Chat state
│   ├── config/              # Configuration files
│   │   └── firebase.ts      # Firebase initialization
│   ├── styles/              # CSS modules
│   │   ├── global.css
│   │   ├── layout.css
│   │   └── auth.css
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── public/                  # Static assets & PWA icons
│   └── manifest.json        # PWA manifest
├── vite.config.ts          # Vite & PWA configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies & scripts
├── SETUP_GUIDE.md          # Detailed setup instructions
└── README.md               # This file
```

## 🏗️ Architecture

### Frontend (Client)
- **React 19** with TypeScript for type safety
- **Vite** for lightning-fast development and optimized builds
- **Zustand** for lightweight state management
- **Service Worker + Workbox** for offline support and caching

### Backend (Firebase)
- **Authentication**: Email/password, Google OAuth
- **Firestore**: Real-time NoSQL database
- **Cloud Storage**: File uploads (images, videos)
- **Cloud Functions**: Serverless backend logic

### Payments (Stripe)
- **Subscriptions**: Monthly plans (Free, Pro, Premium)
- **Webhooks**: Payment event handling
- **Customer Portal**: Subscription management

## ✨ Features

### Phase 1 ✅ Complete
- [x] Project scaffolding with Vite + React + TypeScript
- [x] PWA configuration with service worker support
- [x] Firebase authentication (Email/Password, Google OAuth)
- [x] User profile management in Firestore
- [x] Basic routing and layout structure
- [x] Responsive design with gradient UI
- [x] Environment configuration system

### Phase 2 🚀 In Progress
- [ ] Real-time chat room functionality
- [ ] Message broadcasting with Firestore listeners
- [ ] User presence & typing indicators
- [ ] Message reactions & attachments
- [ ] Room creation & member management

### Phase 3 📍 Planned
- [ ] Geolocation API integration
- [ ] Nearby rooms discovery algorithm
- [ ] Location-based room filtering
- [ ] User location privacy controls
- [ ] Map view of nearby chat rooms

### Phase 4 💳 Planned
- [ ] Stripe subscription integration
- [ ] Payment checkout flow
- [ ] Plan upgrade/downgrade
- [ ] Billing portal
- [ ] Webhook handling for payment events

### Phase 5 📱 Planned
- [ ] Mobile app optimizations
- [ ] Push notifications
- [ ] Offline message queuing
- [ ] Image/video compression
- [ ] Mobile testing & refinement

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server with HMR

# Production
npm run build           # Build for production (TypeScript + Vite)
npm run preview         # Preview production build locally

# Code Quality
npm run lint            # Run ESLint on all files
npm run lint -- --fix   # Auto-fix linting issues
```

## 🔐 Security & Best Practices

### Authentication
- Secure Firebase auth with email verification
- Google OAuth with proper redirect URIs
- Automatic session management
- Password strength validation (client + server)

### Database Security
- Firestore security rules for data protection
- User data isolation (each user can only access their own data)
- Room access control based on membership
- Message ownership validation

### Payment Security
- Stripe PCI compliance
- Secure webhook signature verification
- Never expose secret keys in frontend code
- Rate limiting on sensitive endpoints

### PWA Security
- HTTPS required for service workers
- Secure caching strategies
- Content Security Policy headers
- Manifest validation

## 📚 Detailed Setup Guide

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for comprehensive instructions on:
- Firebase project creation
- Firestore schema design
- Stripe account setup
- Environment configuration
- Database rules
- Deployment options

## 🌐 Firestore Schema

### Collections
- **users**: User profiles and subscription status
- **rooms**: Chat rooms with geolocation data
- **messages**: Real-time chat messages
- **subscriptions**: Stripe subscription information
- **payments**: Payment transaction history

See [SETUP_GUIDE.md](./SETUP_GUIDE.md#step-2-firestore-database-schema) for complete schema details.

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```
Fastest deployment with best DX. Set environment variables in dashboard.

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```
Great alternative with good CI/CD integration.

### Firebase Hosting
```bash
firebase deploy
```
Direct Firebase deployment with automatic CDN.

## 📱 PWA Features

### Install on Mobile
1. Open app in mobile browser
2. Tap "Add to Home Screen" or "Install" prompt
3. App launches full-screen without browser UI
4. Works offline with cached assets

### Service Worker
- Automatic precaching of app shell
- Network-first strategy for chat data
- Cache-first strategy for static assets
- Background sync for messages

## 🧪 Testing

### Test with Stripe
Use these test card numbers in development:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`

Any future expiration date and any 3-digit CVC.

### Firebase Emulator (Optional)
```bash
firebase emulators:start
# Runs local Firebase for development without internet
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in vite.config.ts or use:
npm run dev -- --port 3000
```

### CORS Issues
- Check Firebase CORS configuration
- Verify OAuth redirect URIs in Firebase console
- Ensure Stripe public key is correct

### Service Worker Not Updating
- Hard refresh (Cmd+Shift+R on Mac)
- Clear site data in DevTools
- Check Service Workers tab in DevTools

### Firestore Rules Errors
- Review Firestore Rules tab in Firebase console
- Check user authentication state
- Verify collection structure matches rules

## 📖 Documentation

- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Vite Documentation](https://vite.dev)
- [React 19 Docs](https://react.dev)
- [Workbox Guide](https://developers.google.com/web/tools/workbox)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)

## 🎯 Next Steps

1. **Set up Firebase Project** (see SETUP_GUIDE.md)
2. **Configure Stripe** (test mode account)
3. **Build Chat UI** (ChatRoom, MessageList components)
4. **Implement Geolocation** (location tracking & discovery)
5. **Add Stripe Integration** (subscription checkout)
6. **Deploy** (Vercel/Netlify/Firebase)

## 📝 Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=

# App
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:3000
```

## 🤝 Contributing

This is a personal project, but contributions are welcome!

## 📄 License

MIT License - feel free to use this for your projects

## 🎓 Learning Resources

This project demonstrates:
- Modern React patterns (Hooks, Context)
- TypeScript for type safety
- Firebase realtime features
- PWA fundamentals
- Stripe payment integration
- Vite build optimization
- Zustand state management
- Service Worker patterns

## 📞 Support

For issues:
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md#troubleshooting)
2. Review browser DevTools console
3. Check Firebase console for errors
4. Verify environment variables are set correctly

---

**Happy coding!** 🚀
# pwa-chat-app
