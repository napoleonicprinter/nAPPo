# Publishing Your nAPPo Trails Application

This guide outlines the steps to deploy your React application built with Vite to a live web server.

## Step 1: Prepare Your Project

Before publishing, you need to create a production-ready version of your app. This "build" optimizes your code for performance.

### Running the Build
In your terminal, run the following command:
```powershell
npm run build
```

> [!IMPORTANT]
> **Windows Security Note**: If you see an error about "Execution Policies", you may need to run this command in your terminal first to allow scripts:
> `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

This will create a `dist` folder in your project directory. This folder contains all the files (HTML, CSS, JS) that need to be uploaded to a server.

---

## Step 2: Choose a Hosting Platform

Here are the three easiest ways to host your application for free or at a low cost.

### Option A: Netlify (Easiest / Recommended)
Netlify is the simplest way to get your app online.
1. Create a free account at [Netlify.com](https://www.netlify.com/).
2. **Drag & Drop**: Simply drag the `dist` folder from your file explorer onto the Netlify "Sites" area.
3. Your app will be live instantly with a custom URL.

### Option B: GitHub Pages (Free & Integrated)
If your code is on GitHub, you can host it directly.
1. **Modify `vite.config.js`**: Add the `base` property with your repository name:
   ```javascript
   export default defineConfig({
     base: '/your-repo-name/', // Important for GitHub Pages
     plugins: [react()],
   })
   ```
2. **Deploy**: You can use the `gh-pages` package or set up a GitHub Action to automate the build and deploy process.

### Option C: Vercel
Similar to Netlify, Vercel offers seamless integration with Git.
1. Connect your GitHub/GitLab repository to [Vercel](https://vercel.com/).
2. Vercel will automatically detect the "Vite" project and run `npm run build` for you every time you push code.

---

## Summary of Publishing Flow
1. **Develop**: Complete your features.
2. **Build**: Run `npm run build` to get the `dist` folder.
3. **Deploy**: Upload the `dist` folder content to your host of choice.
