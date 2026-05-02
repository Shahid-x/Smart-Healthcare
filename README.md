# Smart-Healthcare
A modern healthcare directory platform to search and discover doctors and chemists with smart filters, live search, and clean UI.
# 🩺 NIROG DISHA – Patna Healthcare Directory

**NIROG DISHA** is a premium, production-quality healthcare directory designed for Patna, Bihar. It connects patients with **674+ verified doctors** and **200+ chemists** across urban and rural blocks — with a modern, mobile-first interface that rivals real healthcare platforms.

> *Your health, our direction.*

---

## 🚀 Overview

The platform transforms complex healthcare provider datasets into a beautiful, interactive directory with smart search, real-time filtering, and one-tap contact features. Built with a focus on **visual excellence**, **mobile responsiveness**, and **real-world usability**.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3 (Vanilla), JavaScript (ES6+) |
| **Design System** | Glassmorphism, Inter & Poppins typography, micro-animations |
| **Maps** | Google Maps Embed API for location services |
| **Data** | Local JS-based data (no backend server required) |
| **Storage** | localStorage for reviews, auth, recent searches |

---

## 📂 Project Structure

```text
smart-health/
├── frontend/                  # User Interface Layer
│   ├── index.html             # Main entry point & layout structure
│   ├── style.css              # Design system & responsive styles (2600+ lines)
│   ├── hero-bg2.jpg           # Hero section background
│   └── doctor-login-bg.png    # Auth modal visual asset
├── backend/                   # Data & Logic Layer
│   ├── script.js              # Core app logic (1500+ lines)
│   ├── doctor.js              # Doctor data provider (674 doctors)
│   ├── chemist_data.js        # Chemist data provider (200+ chemists)
│   ├── doctor.json            # Raw doctor database
│   └── chemist_data.json      # Raw chemist database
└── README.md                  # This file
```

---

## ✨ Key Features

### 🧠 Smart Search Suggestions
Real-time, categorized search suggestions that appear as you type — just like Google or Practo:
- **Debounced input** (150ms) for smooth performance
- **Categorized results**: Doctors 👨‍⚕️, Hospitals 🏥, Locations 📍, Chemists 💊
- **Highlighted matching text** in bold
- **Keyboard navigation**: ↑/↓ arrows, Enter to select, Escape to close
- **Recent searches**: Last 5 searches saved and shown on focus
- Max **8 suggestions** shown, prioritized by category

### 🔍 Advanced Search & Filtering
- **Unified search**: Real-time filtering by name, address, block, qualification, or contact
- **Multi-factor filters**: Filter by Block, DMC/Hospital, and Technical Unit (TU)
- **Quick filters**: Instantly toggle between Urban, Rural, and All listings
- **Active filter count badge**: Shows how many filters are active
- **Collapsible filter panel**: Collapses behind a toggle button on mobile

### 📱 Mobile-First Responsive Design
Fully responsive across all device sizes with dedicated mobile optimizations:
- **Animated hamburger menu** (☰ → ✕) with slide-down navigation panel
- **Collapsible filter panel** with toggle button on screens ≤ 900px
- **Single-column card layout** on phones for easy scrolling
- **Compact stats grid**, touch-friendly pagination
- **Full-screen modals** with proper touch scrolling
- **Breakpoints**: 1180px → 900px → 640px → 440px

### ⚡ Loading Animations (Skeleton UI)
Professional skeleton loading screens that mirror the actual card layout:
- **Avatar placeholder**, title lines, detail grids, and footer elements
- **Smooth shimmer gradient** animation
- **Fade-in transition** when real content loads

### 🗂️ Dual Directory System
- **Doctor Directory**: 674 medical professionals with qualifications, contact info, and location badges
- **Chemist Directory**: 200+ local chemists with independent pagination and filtering

### 👤 Premium Profile Modals
- Detailed profile views with all provider information
- **Integrated Google Maps** showing the exact area
- **One-tap actions**: Direct Call, WhatsApp, and Get Directions buttons
- Doctor-specific fields: Compounder info, TU, DMC, location type

### ⭐ Patient Reviews System
- **Overall rating summary** with average score and star display
- **Rating distribution bars** (5★ to 1★ breakdown)
- **Review submission modal** with star rating input
- Reviews persist via localStorage

### 🔐 Authentication UI
- Modern glassmorphism login/signup modal
- Social login placeholders (Google, Facebook)
- Smooth toggle between Login and Create Account modes
- Mock auth system with localStorage persistence

### 📍 Geolocation (Find Near Me)
- Browser geolocation via `navigator.geolocation`
- Reverse geocoding with OpenStreetMap Nominatim API
- Auto-fills search with your postcode or locality

---

## 🎨 Design Highlights

- **Dark navy navbar** with blur backdrop and subtle glow
- **Glassmorphism hero section** with gradient text and frosted glass search bar
- **Animated gradient border glow** on doctor cards (hover)
- **Smooth micro-animations**: `fadeInUp`, `shimmer`, `glowPulse`
- **Custom scrollbar** with gradient thumb
- **Professional color palette**: Navy, Blue, Cyan, Emerald accents

---

## 🚀 How to Run

Since this is a client-side application, it can be served using any local server:

### Option 1: VS Code Live Server
Open the folder and use the **Live Server** extension to launch `frontend/index.html`.

### Option 2: Python
```bash
cd "smart health"
python -m http.server 8080
```
Then open: `http://localhost:8080/frontend/index.html`

### Option 3: Direct
Open `frontend/index.html` directly in a browser. A local server is recommended for best results.

---

## 📊 Data Management

Doctor and chemist data is stored in `backend/doctor.json` and `backend/chemist_data.json`. These are wrapped in `.js` files (`doctor.js`, `chemist_data.js`) that assign data to `window.doctorData` and `window.chemistData` globals, enabling direct browser loading without a backend API.

---

## 📱 Browser Support

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Mobile Chrome/Safari | ✅ Full |

---

**NIROG DISHA** – *Your health, our direction.* 🩺
