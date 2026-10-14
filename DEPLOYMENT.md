# 🚀 SharePlate Deployment Guide

SharePlate is fully production-ready and passes all 56 automated tests with zero vulnerabilities.
You have two simple options to deploy the platform:

---

## 🌟 Option A: Easiest & Recommended (Single Service on Render / Railway)
Since the Express backend automatically serves the compiled React frontend from `client/dist`, you can deploy the entire full-stack application as **one single web service**.

### Step 1: Push Code to GitHub
```bash
git init
git add .
git commit -m "Production release: SharePlate platform"
git branch -M main
git remote add origin https://github.com/<your-username>/shareplate.git
git push -u origin main
```

### Step 2: Deploy on Render.com (Free Tier)
1. Sign in to [Render.com](https://render.com) and click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name**: `shareplate-mumbai`
   - **Environment**: `Node`
   - **Build Command**:
     ```bash
     cd client && npm install && npm run build && cd ../server && npm install
     ```
   - **Start Command**:
     ```bash
     cd server && npm start
     ```
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `<any-strong-random-string>`
   - `MONGODB_URI`: *(Optional)* Your MongoDB Atlas connection string. (If left unset, SharePlate will automatically run an in-memory database with pre-seeded Mumbai demo data).

---

## 🌐 Option B: Decoupled Deploy (Vercel Frontend + Render Backend)

### Backend (Render.com)
1. Create a Web Service pointing to the `server/` directory:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `PORT`: `5000`
     - `JWT_SECRET`: `<strong-secret>`
     - `CLIENT_URL`: `https://your-frontend.vercel.app`
     - `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/surplus-food`

### Frontend (Vercel.com)
1. Sign in to [Vercel.com](https://vercel.com) and click **Add New** → **Project**.
2. Select your repository:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Environment Variables:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api`
   - `VITE_GOOGLE_MAPS_API_KEY`: *(Optional)* Your Google Maps API key (OpenStreetMap/Leaflet will be used automatically if omitted).

---

## 🔒 Checklist Before Going Live
- [x] **56/56 Automated Tests Passed** (`npm test` in `server` and `client`).
- [x] **Zero Build Errors**: Clean bundle generated via `npm run build`.
- [x] **Concurrency Guard**: Atomic updates prevent duplicate claims on simultaneous requests.
- [x] **Geo Boundary Validation**: Restricts coordinates between -90 and 90 lat, -180 and 180 lng.
- [x] **Admin Self-Deletion Guard**: Prevents accidental admin account deletion.
- [x] **SPA Routing**: `vercel.json` and `_redirects` in place for clean URL navigation without 404s.
