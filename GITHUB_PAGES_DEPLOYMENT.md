# MS Official - GitHub Pages & Full-Stack Deployment Guide

This repository contains both the **Frontend** (React + Vite + Tailwind CSS) and the **Full Backend** (Express + Transactional JSON Database).

---

## 🚀 Option 1: Automatic Deployment via GitHub Actions (Recommended)

1. Create a new repository on [GitHub](https://github.com/new).
2. Push this entire codebase to your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of MS Official fullstack app"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git push -u origin main
   ```
3. Go to your GitHub repository **Settings**:
   - Click **Pages** in the left sidebar.
   - Under **Build and deployment > Source**, select **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` will automatically build and publish your site!
   - Your site will be live at: `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`

---

## 🚀 Option 2: Direct Upload of `dist/` Folder to `gh-pages` Branch

If you don't want to use GitHub Actions, you can deploy the included `dist/` folder directly:

```bash
git subtree push --prefix dist origin gh-pages
```
Or install `gh-pages`:
```bash
npx gh-pages -d dist
```

---

## ⚙️ Backend Connectivity with GitHub Pages

Since GitHub Pages only hosts static frontend files, this app is configured with **dual-mode API routing**:

1. **Automatic Cloud Fallback (Zero Config)**:
   When visited on `*.github.io`, the frontend automatically connects to the hosted cloud backend (`https://ais-dev-w3jyztby6skrlvoibagcqo-813832143668.asia-southeast1.run.app/api`), so user accounts, login, attendance check-in, package activation, and admin portal work immediately!

2. **Connecting to Your Own Backend (Render / Railway / VPS)**:
   If you deploy the included backend to your own host (e.g. Render, Railway, or VPS):
   - Set the environment variable in your frontend:
     ```env
     VITE_API_URL=https://your-backend-api.onrender.com/api
     ```
   - In GitHub repository secrets/variables: add `VITE_API_URL` under **Settings > Secrets and variables > Actions > Variables**.

---

## 🖥️ Running Full-Stack Locally

Run both Frontend & Backend together with hot reload:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Admin Credentials
- **Email**: `developeralihusnain@gmail.com`
- **Password**: `admin123`
- **Secondary**: `admin@msofficial.com` / `admin123`
