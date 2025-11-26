#!/bin/bash
# Quick Start Checklist - PWA Chat App
# Copy and paste commands as you complete each step

echo "🚀 PWA Chat App - Quick Start Guide"
echo "===================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Environment Setup${NC}"
echo "[ ] Navigate to project directory"
echo "    cd pwa-chat-app"
echo ""
echo "[ ] Copy environment template"
echo "    cp .env.example .env.local"
echo ""
echo "[ ] Edit .env.local with your credentials"
echo "    nano .env.local"
echo ""

echo -e "${BLUE}Step 2: Firebase Project Setup${NC}"
echo "[ ] Go to https://console.firebase.google.com"
echo "[ ] Create new project named 'pwa-chat-app'"
echo "[ ] Enable Firestore Database"
echo "[ ] Enable Authentication (Email/Password + Google)"
echo "[ ] Enable Cloud Storage"
echo "[ ] Copy credentials to .env.local"
echo ""

echo -e "${BLUE}Step 3: Verify Project Setup${NC}"
echo "[ ] Install dependencies (already done)"
echo "[ ] Test build"
echo "    npm run build"
echo ""

echo -e "${BLUE}Step 4: Start Development${NC}"
echo "[ ] Start dev server"
echo "    npm run dev"
echo ""
echo "[ ] Open http://localhost:5173 in browser"
echo "[ ] Try registering/logging in"
echo ""

echo -e "${BLUE}Step 5: Optional - Firebase Emulator${NC}"
echo "[ ] Install Firebase CLI"
echo "    npm install -g firebase-tools"
echo ""
echo "[ ] Start emulator (in another terminal)"
echo "    firebase emulators:start"
echo ""
echo "[ ] Update firebase.ts to use localhost"
echo ""

echo -e "${BLUE}Step 6: Stripe Setup (For Phase 4)${NC}"
echo "[ ] Go to https://dashboard.stripe.com"
echo "[ ] Create test account"
echo "[ ] Get publishable and secret keys"
echo "[ ] Add to .env.local"
echo ""

echo -e "${YELLOW}📚 Documentation Files${NC}"
echo "- README.md: Project overview & quick start"
echo "- SETUP_GUIDE.md: Detailed setup instructions"
echo "- DEVELOPMENT.md: Phase-by-phase roadmap"
echo "- PROJECT_SUMMARY.md: This project summary"
echo ""

echo -e "${YELLOW}🎯 Next Steps${NC}"
echo "1. Complete Step 1-2 above (Firebase setup)"
echo "2. Test authentication (Step 4)"
echo "3. Read DEVELOPMENT.md for Phase 2 (Chat)"
echo "4. Build chat components"
echo ""

echo -e "${GREEN}✨ Good luck building!${NC}"
