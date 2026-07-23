# ☕ Kapehan - Local Coffee Finder & Community

**Kapehan** is a modern, responsive web and mobile application designed to help coffee enthusiasts discover local coffee shops, explore menu items, rate and review cafes, interact with a passionate community, and save favorite spots. Built with **React**, **Vite**, **Capacitor** (iOS support), and integrated with **Supabase** for backend services.

---

## 🌟 Features

- 🗺️ **Interactive Coffee Map**: Explore nearby local coffee shops using Leaflet maps with custom pins and geolocation.
- ☕ **Shop Profiles & Menus**: View detailed shop information, operating hours, amenities, menu items, prices, and ratings.
- 💬 **Community & Social Feed**: Share coffee check-ins, posts, reviews, and images with fellow coffee lovers.
- 🔔 **Real-time Notifications**: Stay updated with community interactions and shop updates.
- 📱 **Cross-Platform Mobile Support**: iOS native support configured via Capacitor.
- 🔑 **Authentication & Database**: Powered by Supabase for user auth, data persistence, and storage.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Mapping**: Leaflet, React-Leaflet
- **Icons**: Lucide React
- **Mobile Runtime**: Capacitor 8 (iOS)
- **Backend & Database**: Supabase JS Client (`@supabase/supabase-js`)
- **Styling**: Modern CSS with dark/light visual design tokens

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- `npm` or `yarn`
- CocoaPods & Xcode (for iOS mobile builds)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/klaayd39/local-coffee-app.git
   cd local-coffee-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file based on `.env.example`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

---

## 📱 Mobile Setup (iOS)

To run or build the app for iOS via Capacitor:

```bash
# Build the web assets
npm run build

# Sync web assets to iOS platform
npx cap sync ios

# Open Xcode project
npx cap open ios
```

---

## 📜 Scripts

- `npm run dev`: Launches the local Vite development server.
- `npm run build`: Bundles the project for production.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs ESLint for code analysis.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a pull request.

---

## 📄 License

This project is open-source and available under standard terms.
