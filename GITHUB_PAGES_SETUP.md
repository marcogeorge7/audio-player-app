# 🚀 ULTIMATE GitHub Pages Setup Guide

## 🎯 Your Goal: Get the Audio Player working on GitHub Pages

Since your repo is already on GitHub, let's get it deployed properly.

## ✅ STEP 1: Manual GitHub Pages Setup (GUARANTEED TO WORK)

### Go to your GitHub repository and do this:

1. **Settings** → **Pages** (left sidebar)
2. **Source**: Select **"Deploy from a branch"** (NOT GitHub Actions for now)
3. **Branch**: Select **"main"** 
4. **Folder**: Select **"/ (root)"**
5. **Click Save**

## ✅ STEP 2: Create a Simple Build Script

Let's create a script that builds and commits the static files to a `gh-pages` branch:

```bash
# This will create the build script for you
cat > build-and-deploy.sh << 'EOF'
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
EOF

# Make it executable
chmod +x build-and-deploy.sh
```

## ✅ STEP 3: Deploy Your App

Run the deploy script:

```bash
./build-and-deploy.sh
```

## ✅ STEP 4: Configure GitHub Pages (Final Step)

1. **Go back to Settings → Pages**
2. **Source**: Select **"Deploy from a branch"**
3. **Branch**: Select **"gh-pages"** 
4. **Folder**: Select **"/ (root)"**
5. **Click Save**

## 🎉 DONE!

Your app should be live at: `https://yourusername.github.io/repository-name`

---

## 🔄 Alternative: If You Want Automatic Deployment

If you prefer automatic deployment when you push to main, use this GitHub Actions workflow instead:

**Create `.github/workflows/deploy.yml`:**

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

Then set **Source** to **"gh-pages"** branch in Pages settings.

---

## 🐛 Troubleshooting

- **404 errors**: Make sure `.nojekyll` file exists in gh-pages branch
- **CSS not loading**: Check if base path is set correctly for repository deployment
- **Build fails**: Run `npm run build` locally first to test

---

**Choose Method 1 (manual script) for guaranteed success, or Method 2 (GitHub Actions) for automatic deployment.**