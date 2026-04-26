#!/bin/bash

# Workflow Pro Backend - Quick Setup Script
# This script automates the backend setup process

set -e

echo "🚀 Workflow Pro Backend - Quick Setup"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if MongoDB is running (optional, can work without it initially)
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not in PATH. Please ensure MongoDB is running."
    echo "   For macOS: brew services start mongodb-community"
    echo "   For Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
if command -v bun &> /dev/null; then
    bun install
else
    npm install
fi
echo "✅ Dependencies installed"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
PORT=5123
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/workflow-pro
JWT_SECRET=workflow-pro-super-secret-key-2024-change-in-production
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎯 Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Ensure MongoDB is running"
echo "2. Run: npm run seed (to populate test data)"
echo "3. Run: npm run dev (to start development server)"
echo ""
echo "🔗 API will be available at: http://localhost:5123"
echo "📊 Health check: http://localhost:5123/health"
echo ""
