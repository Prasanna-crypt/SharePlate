# 🍽️ Surplus Food Redistribution Platform (SharePlate)

> **College Community Engagement Project**  
> **Course:** B.Sc. Computer Science  
> **Institution:** Thakur Shyamnarayan Degree College, Mumbai  
> **Location Focus:** Kandivali, Borivali, Malad & Greater Mumbai  

---

## 📌 Problem Statement (Survey of 85 Respondents)
From our community survey conducted across 85 households, restaurants, caterers, and housing societies in Mumbai:
- Households and food businesses regularly generate safe surplus food but end up discarding it.
- **Top barriers to donating:** Donors do not know where to donate, quantities often feel small, and transport/time is limited.
- **Most common surplus type:** Prepared and freshly cooked meals.
- **Willingness:** Over 88% of respondents expressed willingness to use an easy digital platform connecting them with verified NGOs and volunteer groups.
- **Key need:** Simplified, organized pickup coordination between donors, NGOs, and community volunteers.

---

## 🌟 Solution Overview
**SharePlate** is a full-stack web platform enabling:
1. **Donors** (households, restaurants, caterers, housing societies) to list safe surplus food within minutes with details, expiry countdowns, food safety verification checklists, and Google Maps location pins.
2. **Receivers** (NGOs, soup kitchens, community shelters) to find nearby food via List View or interactive Google Maps View, filter by distance, food category, dietary preferences (Veg/Non-Veg), and claim items.
3. **Volunteers** to accept pickup and delivery tasks for claimed listings to bridge transportation gaps.
4. **Admins** to oversee users, listings, platform health, and community redistribution metrics.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite build system)
- **React Router v6** (Client-side routing with role-based guards)
- **Axios** (API communication with JWT request interceptors)
- **@react-google-maps/api** (Google Maps JavaScript API, Places Autocomplete, Draggable Markers & OpenStreetMap fallback)
- **HTML5 & CSS3** (Mobile-first responsive styling inspired by BITE Squarespace design with warm green & orange palette)

### Backend
- **Node.js & Express.js** (REST API)
- **MongoDB & Mongoose** (GeoJSON 2dsphere indexing for `$near` geospatial queries; Atlas support & auto-fallback)
- **JWT & bcryptjs** (Secure authentication and password hashing)
- **express-rate-limit & express-validator** (Security hardening and input sanitization)

---

## 📁 Project Architecture

```
d:\New folder\
├── client/                      # React (Vite) Frontend
│   ├── public/
│   ├── src/
│   │   ├── api/axios.js         # Central Axios client with JWT interceptor
│   │   ├── context/AuthContext  # Global authentication & session state
│   │   ├── components/          # Navbar, Footer, FoodCard, MapView, LocationPicker,
│   │   │                        # ImpactCounter, NotificationBell, StatusBadge, etc.
│   │   ├── pages/               # Home, About, FindFood, DonateFood, ListingDetails,
│   │   │                        # Donor/Receiver/Admin Dashboards, VolunteerTasks, Contact
│   │   ├── utils/helpers.js     # Date formatting, expiry countdowns, status badges
│   │   ├── App.jsx              # Main Router setup with role guards
│   │   └── index.css            # Design tokens, variables & responsive utilities
│   ├── .env.example             # Client environment template
│   └── package.json
│
├── server/                      # Node.js + Express Backend
│   ├── config/db.js             # Mongoose MongoDB connection
│   ├── models/                  # User, FoodListing (GeoJSON), Claim, Notification, Feedback
│   ├── routes/                  # auth, listings, claims, notifications, feedback, stats, admin
│   ├── middleware/              # JWT auth, role authorization, centralized error handling
│   ├── utils/validators.js      # Express-validator schemas
│   ├── seed.js                  # Realistic demo seeder for Kandivali, Borivali, Malad
│   ├── server.js                # Express app entry with auto-expiry timer
│   ├── .env.example             # Server environment template
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- A MongoDB Atlas connection string (or local MongoDB)
- *(Optional)* A Google Maps Platform API Key

---

### Step 1: Backend Setup

1. Open a terminal in the `server` directory:
   ```bash
   cd server
   npm install
   ```

2. Create your `.env` file from the template:
   ```bash
   cp .env.example .env
   ```

3. Update `server/.env` with your settings:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/surplus-food?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   CLIENT_URL=http://localhost:5173
   ```

4. Populate realistic demo data (10 donors, 5 NGOs, 20 listings across Mumbai):
   ```bash
   npm run seed
   ```

5. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   *The API will start at `http://localhost:5000`.*

---

### Step 2: Frontend Setup

1. Open another terminal in the `client` directory:
   ```bash
   cd client
   npm install
   ```

2. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Update `client/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```
   *(Note: If you do not have a Google Maps key right away, SharePlate will automatically fall back to an interactive OpenStreetMap preview and Mumbai area presets without crashing!)*

4. Start Vite development server:
   ```bash
   npm run dev
   ```
   *Open your browser at `http://localhost:5173`.*

---

## 🔑 Demo Login Credentials (from Seed Script)

| Role | Email | Password | Description |
|---|---|---|---|
| **Admin** | `admin@surplusfood.in` | `admin123` | Platform monitor & user/listing management |
| **Donor** | `raj@demo.com` | `password123` | Household donor (Kandivali East) |
| **Donor (Restaurant)** | `anand@demo.com` | `password123` | Anand Bhavan Restaurant (Borivali West) |
| **Donor (Caterer)** | `tiffins@demo.com` | `password123` | Mumbai Tiffins Caterers (Borivali West) |
| **Receiver (NGO)** | `roti@demo.com` | `password123` | Roti Foundation Mumbai (Borivali East) |
| **Receiver (Trust)** | `annadaan@demo.com` | `password123` | Anna Daan Charitable Trust (Kandivali East) |

---

## 🗺️ How to Get a Google Maps API Key
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `Surplus Food Redistribution`.
3. Navigate to **APIs & Services > Library** and enable:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
4. Navigate to **APIs & Services > Credentials** and click **Create Credentials > API key**.
5. Copy your API key and paste it into `client/.env` as `VITE_GOOGLE_MAPS_API_KEY=AIzaSy...`.
6. *(Recommended)* Under key restrictions, restrict HTTP referrers to `http://localhost:5173/*`.

---

## 🍃 How to Get a MongoDB Atlas URI
1. Sign up / Log in at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a free **M0 Cluster**.
3. Under **Database Access**, add a database user (e.g., `surplus_admin` with a secure password).
4. Under **Network Access**, add IP address `0.0.0.0/0` (allow access from anywhere for development).
5. Click **Connect > Drivers (Node.js)** and copy your connection string:
   ```
   mongodb+srv://surplus_admin:<password>@cluster0.abcde.mongodb.net/surplus-food?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your database user password and paste into `server/.env`.

---

## 📡 API Reference Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register donor or receiver with name, email, phone, role, organization.
- `POST /api/auth/login` — Authenticate and receive JWT token.
- `GET /api/auth/me` — Get authenticated user profile (`Bearer <token>`).
- `PUT /api/auth/me` — Update personal or organization profile details.

### Food Listings (`/api/listings`)
- `POST /api/listings` — Create a surplus food listing (Donor only).
- `GET /api/listings` — Query active listings with filters (`foodType`, `vegNonVeg`, `sort=expiring`).
- `GET /api/listings/nearby?lat=19.2137&lng=72.8656&radius=10` — Geospatial `$near` query within radius in kilometers.
- `GET /api/listings/my` — Get donor's own listings and history.
- `GET /api/listings/:id` — Single listing view with donor privacy protection.
- `PUT /api/listings/:id` — Update listing details (Listing owner only).
- `DELETE /api/listings/:id` — Cancel or delete listing.

### Claims & Distribution (`/api/claims`)
- `POST /api/claims` — Receiver claims available food (`{ listingId, notes }`).
- `GET /api/claims/my` — Receiver's claimed items and active delivery history.
- `GET /api/claims/volunteer-tasks` — View claimed items in need of a volunteer delivery partner.
- `PUT /api/claims/:id/volunteer` — Volunteer accepts a delivery assignment.
- `PUT /api/claims/:id/pickup` — Mark listing as `Picked Up`.
- `PUT /api/claims/:id/complete` — Mark listing as `Completed / Delivered`.
- `PUT /api/claims/:id/cancel` — Cancel claim and restore listing to `Available`.

### Notifications (`/api/notifications`)
- `GET /api/notifications` — Fetch user notifications.
- `PUT /api/notifications/:id/read` — Mark notification as read.
- `PUT /api/notifications/read-all` — Bulk mark all notifications as read.

### Impact & Stats (`/api/stats`)
- `GET /api/stats/impact` — Public counters: meals redistributed, active donors, NGOs registered, total listings.
- `GET /api/stats/admin` — Admin analytics (breakdown of users, active listings, completions).

### Feedback & Reporting (`/api/feedback`)
- `POST /api/feedback` — Submit feedback or report an issue with a food listing.
- `GET /api/feedback` — View all feedback/reports (Admin only).

### Admin (`/api/admin`)
- `GET /api/admin/users` — List all registered users.
- `DELETE /api/admin/users/:id` — Remove user account.
- `GET /api/admin/listings` — List all listings regardless of status.
- `DELETE /api/admin/listings/:id` — Remove listing.

---

## 🛡️ Safety & Quality Principles
- **Mandatory Safety Checklist:** Donors must certify that listed food is freshly prepared, stored hygienically, and not previously served.
- **Auto-Expiration Mechanism:** The background engine scans every 5 minutes and flags food as `Expired` once the "Safe Until" window passes.
- **Donor Privacy:** Contact telephone numbers and direct Google Maps navigation are masked until an item is claimed by a verified receiver.
- **Safety Disclaimers:** Visible disclaimers advise receivers on temperature control, hygiene inspection, and consumption timelines.

---

## 🎓 Academic Attribution
Developed as part of the **Community Engagement Project** for the **B.Sc. Computer Science** curriculum at **Thakur Shyamnarayan Degree College, Mumbai**.
