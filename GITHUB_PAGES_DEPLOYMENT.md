# 🎵 Audio Player GitHub Pages Deployment Guide

Your audio player app has been configured for GitHub Pages deployment! This is a completely static deployment that requires no server infrastructure.

## 🚀 Quick Deployment Steps

### 1. Push Your Code to GitHub

If you haven't already, create a GitHub repository and push your code:

```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit: Audio Player App"

# Create repository on GitHub, then:
git branch -M main
git remote add origin https://github.com/yourusername/your-repository-name.git
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**
5. The workflow will automatically run when you push to main/master

### 3. Configure Repository Name (If Needed)

**Option A: Deploy to `username.github.io`**
- Repository name must be: `username.github.io`
- No configuration needed
- App will be available at: `https://username.github.io`

**Option B: Deploy to `username.github.io/repository-name`**
- Repository can have any name
- The GitHub Action automatically handles the base path
- App will be available at: `https://username.github.io/repository-name`

## 📁 Project Structure

```
audio-player-app/
├── .github/workflows/
│   └── deploy.yml           # GitHub Actions deployment workflow
├── public/
│   ├── audio/              # Audio files directory
│   └── data/
│       └── audio-files.json # Static audio file metadata
├── src/                    # Next.js source code
├── out/                    # Static export output (created by build)
├── next.config.ts          # Next.js configuration for GitHub Pages
└── .env.local             # Environment variables
```

## 🎵 How It Works

### Static Site Generation
- Next.js builds a completely static version (HTML/CSS/JS)
- No server-side code or API routes
- All functionality runs in the browser

### Audio File Management
- Audio files stored in `public/audio/`
- Metadata stored in `public/data/audio-files.json`
- No dynamic file scanning (static list only)

### File Upload
- File upload is disabled (GitHub Pages doesn't support server functionality)
- To add files: Add to repository and update the JSON file

## 🔄 Adding New Audio Files

To add new audio files to your deployed app:

### 1. Add Files to Repository
```bash
# Add your audio files to the public/audio directory
cp path/to/your/audio/file.mp3 public/audio/

git add public/audio/file.mp3
git commit -m "Add new audio file: file.mp3"
```

### 2. Update the Audio Files List
Edit `public/data/audio-files.json` and add your new file:

```json
{
  "files": [
    // ... existing files ...
    {
      "filename": "file.mp3",
      "label": "Your Audio File",
      "path": "/audio/file.mp3"
    }
  ]
}
```

### 3. Deploy Changes
```bash
git add public/data/audio-files.json
git commit -m "Update audio files list"
git push origin main
```

The GitHub Action will automatically rebuild and deploy your site.

## 🛠️ Local Development

### Development Server
```bash
npm install
npm run dev
```
App available at: http://localhost:3000

### Production Build (Test)
```bash
npm run build
npx serve out
```
App available at: http://localhost:3000

## 🌐 Accessing Your Deployed App

After deployment, your app will be available at:
- **Personal site**: `https://username.github.io` (if repo name is username.github.io)
- **Project site**: `https://username.github.io/repository-name` (for other repo names)

## 🔧 Customization

### Change Repository Base Path
If you need to manually set the base path, edit `.env.local`:

```bash
# For deployment to username.github.io/my-audio-player
NEXT_PUBLIC_BASE_PATH=/my-audio-player
```

### Custom Domain
To use a custom domain:
1. Add a `CNAME` file to `public/` with your domain
2. Configure your domain's DNS to point to GitHub Pages
3. Enable custom domain in repository settings

## 🎯 App Features

Your deployed audio player includes:

✅ **Multi-device audio playback** - Play different playlists on separate audio outputs  
✅ **Playlist management** - Create, edit, and delete playlists  
✅ **Local storage** - Playlists persist in browser  
✅ **Responsive design** - Works on desktop and mobile  
✅ **Static hosting** - No server required, fast global CDN  
✅ **Automatic deployment** - Updates deploy on git push  

❌ **File upload** - Not available (static hosting limitation)  

## 📊 GitHub Pages Limits

GitHub Pages has the following limits:
- **Repository size**: 1 GB max
- **Site size**: 1 GB max  
- **Bandwidth**: 100 GB/month
- **Builds**: 10 per hour

For audio files, consider:
- Optimize file sizes (compress audio)
- Use efficient formats (MP3, AAC)
- Consider external hosting for large collections

## 🐛 Troubleshooting

### Common Issues:

1. **404 on refresh**: GitHub Pages doesn't handle client-side routing by default
   - Solution: Next.js static export handles this automatically

2. **Audio files not loading**: Check file paths and names
   - Ensure files exist in `public/audio/`
   - Check `audio-files.json` for correct paths
   - Verify file names match exactly (case-sensitive)

3. **Build fails**: Check the Actions tab for error details
   - Common: Node.js version mismatch
   - Solution: Ensure compatibility with Node.js 18

4. **Base path issues**: Links not working on repository deployment
   - Solution: The GitHub Action automatically handles base path

### Debug Commands:

```bash
# Test build locally
npm run build
npx serve out

# Check for TypeScript errors
npm run type-check

# Check for linting issues
npm run lint
```

## 🚀 Performance Tips

### Optimization:
- Audio files are served directly from GitHub's CDN
- Static assets are cached aggressively
- No server response time delays

### Best Practices:
- Keep audio files under 50MB each
- Use compressed audio formats
- Organize files logically in directories
- Keep the JSON metadata file updated

## 💰 Cost

GitHub Pages is **completely free** for public repositories!

- ✅ Unlimited static hosting
- ✅ Custom domains
- ✅ HTTPS certificates
- ✅ Global CDN
- ✅ Automatic deployments

## 🎉 You're Ready!

Your audio player is now configured for GitHub Pages deployment. Simply push your code to GitHub and it will automatically deploy!

Key benefits of GitHub Pages deployment:
- **Zero cost** for public repositories
- **No server maintenance** required
- **Global CDN** for fast loading
- **Automatic HTTPS** with custom domains
- **Version control** integrated with deployment
- **Simple workflow** - just git push to deploy

Enjoy your static audio player! 🎵