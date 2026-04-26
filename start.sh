#!/bin/bash
# Workflow Pro - All-in-One Startup Script
# Run this to start everything at once

echo "🚀 Starting Workflow Pro Full Stack"
echo "===================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if in root directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Function to print section
print_section() {
    echo -e "${BLUE}▼ $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check Node.js
print_section "Checking Prerequisites"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi
print_success "Node.js: $(node --version)"

# Check MongoDB
if ! pgrep -x "mongod" > /dev/null; then
    print_warning "MongoDB is not running. Start with:"
    echo "   brew services start mongodb-community"
    echo "   or: docker run -d -p 27017:27017 mongo:latest"
    echo ""
    read -p "Continue without MongoDB? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install dependencies
print_section "Installing Dependencies"
if [ ! -d "node_modules" ]; then
    npm install > /dev/null 2>&1 && print_success "Frontend dependencies installed" || print_warning "Frontend installation failed"
fi

if [ ! -d "backend/node_modules" ]; then
    cd backend
    npm install > /dev/null 2>&1 && print_success "Backend dependencies installed" || print_warning "Backend installation failed"
    cd ..
fi

# Seed database
print_section "Seeding Database"
read -p "Seed database with test data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd backend
    npm run seed > /dev/null 2>&1 && print_success "Database seeded" || print_warning "Seeding may have failed"
    cd ..
fi

# Start servers
print_section "Starting Servers"
echo ""
echo "Backend server will start on: http://localhost:5123"
echo "Frontend will start on: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start backend
cd backend
npm run dev &
BACKEND_PID=$!
sleep 2

# Start frontend
cd ..
npm run dev &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Setup trap to catch Ctrl+C
trap cleanup SIGINT

# Keep script running
wait

