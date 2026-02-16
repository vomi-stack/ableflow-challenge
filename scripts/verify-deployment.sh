#!/bin/bash

echo "=================================="
echo "AbleFlow Deployment Verification"
echo "=================================="
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✓ .env file exists"

    # Check for required environment variables
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env && grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env; then
        echo "✓ Environment variables are set"
    else
        echo "✗ Missing environment variables in .env"
        exit 1
    fi
else
    echo "✗ .env file not found"
    exit 1
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✓ Dependencies installed"
else
    echo "⚠ Dependencies not installed, running npm install..."
    npm install --legacy-peer-deps
fi

# Run tests
echo ""
echo "Running tests..."
npm test -- --run > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ All tests pass"
else
    echo "✗ Tests failed"
    exit 1
fi

# Try to build
echo ""
echo "Building project..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Build successful"
else
    echo "✗ Build failed"
    exit 1
fi

echo ""
echo "=================================="
echo "✓ All checks passed!"
echo "=================================="
echo ""
echo "Your project is ready for deployment."
echo ""
echo "Next steps for Netlify:"
echo "1. Go to https://app.netlify.com"
echo "2. Find your site: ableflow-ai-task-rel-j1gm"
echo "3. Add environment variables in Site settings:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "4. Trigger a new deploy"
echo ""
echo "Or deploy to Vercel (recommended for Next.js):"
echo "1. Go to https://vercel.com"
echo "2. Import your repository"
echo "3. Add the environment variables"
echo "4. Deploy!"
