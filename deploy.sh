#!/bin/bash

# Quick deployment script for GitHub Pages
# Usage: ./deploy.sh

echo "🎵 Audio Player - GitHub Pages Deployment"
echo "=========================================="

# Check if remote origin exists
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "❌ No GitHub remote found!"
    echo "Please first create a GitHub repository and add the remote:"
    echo ""
    echo "git remote add origin https://github.com/yourusername/your-repo-name.git"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Show current status
echo "📊 Current repository status:"
git remote -v
echo ""

# Build the project
echo "🔨 Building production version..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🌟 Next steps:"
    echo "1. Go to your GitHub repository"
    echo "2. Click Settings → Pages"
    echo "3. Under Source, select 'GitHub Actions'"
    echo "4. Your app will be deployed automatically!"
    echo ""
    echo "🌐 Your app will be available at:"
    echo "   https://yourusername.github.io/your-repo-name"
else
    echo "❌ Failed to push to GitHub!"
    exit 1
fi