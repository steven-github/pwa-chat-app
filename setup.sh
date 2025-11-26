#!/bin/bash
# PWA Chat App - One-Click Setup Script
# This script automates the first-time setup process

set -e

echo "🚀 PWA Chat App - Setup Wizard"
echo "================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js $(node -v) found"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 .env.local not found. Creating from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please fill in your Firebase credentials in .env.local"
    echo "   Get them from: https://console.firebase.google.com"
    echo ""
    echo "Steps:"
    echo "  1. Create Firebase project"
    echo "  2. Enable Firestore Database (test mode)"
    echo "  3. Enable Authentication (Email/Password)"
    echo "  4. Copy credentials to .env.local"
    echo "  5. Run this script again"
    exit 1
fi

echo "✅ .env.local found"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Check if dist exists (previous build)
if [ ! -d "dist" ]; then
    echo "🔨 Building project..."
    npm run build
    echo "✅ Build complete"
    echo ""
fi

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo ""
echo "1️⃣  Start development server:"
echo "   npm run dev"
echo ""
echo "2️⃣  Create Firestore collections (pick one):"
echo ""
echo "   📱 Option A: Use the UI (Recommended)"
echo "      - Log in with a test account"
echo "      - Click 'Initialize Collections' button (bottom-right)"
echo ""
echo "   💻 Option B: Browser Console"
echo "      - Log in first"
echo "      - Open DevTools (F12)"
echo "      - Go to Console tab"
echo "      - Paste:"
echo "        import { firebaseInit } from '/src/utils/firestoreSetup.js'"
echo "        import { db } from '/src/config/firebase.js'"
echo "        await firebaseInit(db)"
echo ""
echo "3️⃣  Update Firestore Security Rules:"
echo "      - Go to https://console.firebase.google.com"
echo "      - Select your project → Firestore → Rules"
echo "      - Copy rules from FIRESTORE_SETUP.md"
echo ""
echo "4️⃣  Start building Phase 2 (Chat UI):"
echo "      - See DEVELOPMENT.md for detailed roadmap"
echo ""
echo "📚 Documentation:"
echo "   - FIRESTORE_SETUP.md - Complete Firestore guide"
echo "   - DEVELOPMENT.md     - Phase 2-5 roadmap"
echo "   - README.md          - Project overview"
echo ""
echo "Happy coding! 🎉"
