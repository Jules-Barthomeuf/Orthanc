#!/bin/bash

# ORTHANC Quick Start Script

echo "🏛️  ORTHANC - Commercial Real Estate Digital Vault"
echo "================================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"
echo ""

# Start dev server
echo "🚀 Starting development server..."
echo ""
echo "📱 Application will be available at: http://localhost:3000"
echo ""
echo "Test Accounts:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "👨‍💼 AGENT ACCOUNT"
echo "   Email: michael.johnson@orthanc.com"
echo "   Password: (any password)"
echo "   Role: Agent"
echo ""
echo "💎 CLIENT ACCOUNT"
echo "   Email: john.doe@example.com"
echo "   Password: (any password)"
echo "   Role: Client"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
