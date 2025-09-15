#!/bin/bash

echo "🎵 Building Audio Player for GitHub Pages..."

# Build the app
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Create/switch to gh-pages branch
git checkout -B gh-pages

# Copy built files to root
cp -r out/* .

# Add a .nojekyll file (important for Next.js)
touch .nojekyll

# Add all files
git add .

# Commit
git commit -m "Deploy to GitHub Pages"

# Push to gh-pages branch
git push origin gh-pages --force

# Switch back to main
git checkout main

echo "🚀 Deployed to GitHub Pages!"
echo "🌐 Your app should be live at: https://yourusername.github.io/repository-name"