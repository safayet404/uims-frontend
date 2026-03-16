# UniCore UIMS — Frontend

<div align="center">

![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-3-FFD859?style=for-the-badge&logo=pinia&logoColor=black)

**Modern, responsive frontend for the UniCore University Management System**

</div>

---

## 📋 Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Pages & Features](#pages--features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Deployment](#deployment)

---

## Overview

UniCore UIMS Frontend is a Single Page Application (SPA) built with Nuxt 4 and Vue 3. It provides a clean, intuitive dashboard for managing all university operations — from student admissions to graduation.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Nuxt | 4.x | Meta-framework |
| Vue | 3.x | UI Framework |
| Nuxt UI | 3.3.7 | Component library |
| Tailwind CSS | 4.x | Styling |
| Pinia | 3.x | State management |
| VueUse | 14.x | Composable utilities |
| Zod | 4.x | Schema validation |
| Day.js | 1.x | Date formatting |

---

## Pages & Features

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Split-layout login with demo account badges |
| `/dashboard` | Dashboard | Stats overview, recent activity, quick actions |
| `/students` | Students | Student list, CRUD, search, export |
| `/faculty` | Faculty | Faculty profiles, academic stats |
| `/departments` | Departments | Department management |
| `/programs` | Programs | Degree program management |
| `/courses` | Courses | Course catalog with enrollment progress |
| `/enrollments` | Enrollments | Student registration, approve/reject/drop |
| `/attendance` | Attendance | Mark attendance, P/A/L/E buttons |
| `/attendance/report` | Attendance Report | Per-student attendance % with status |
| `/exams` | Exams | Schedule exams, enter results inline |
| `/grades` | Grades | Enter marks, auto-calculate grades, publish |
| `/fees` | Fee Management | Invoices, structures, defaulters, collect payment |
| `/admissions` | Admissions | Application pipeline with 7-stage workflow |
| `/library` | Library | Book catalog, issue/return, fines |
| `/timetable` | Timetable | Weekly grid + list view, conflict detection |
| `/notifications` | Notifications | In-app notifications, send broadcast |
| `/reports` | Reports | Generate & download PDF reports |
| `/settings` | Settings | 5-tab system configuration |
| `/profile` | Profile | Edit profile, change password, activity |
| `/users` | Users | User management (admin only) |
| `/roles` | Roles | Role & permission matrix (admin only) |
| `/activity-logs` | Activity Logs | Full audit trail |

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 10+

### Local Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/unicore-frontend.git
cd unicore-frontend

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Set your API URL in .env
# NUXT_PUBLIC_API_BASE=http://localhost:8000/api

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

---

## Environment Variables

```env
# Required — your backend API URL
NUXT_PUBLIC_API_BASE=http://localhost:8000/api
```

For production (Vercel):
```env
NUXT_PUBLIC_API_BASE=https://your-backend.onrender.com/api
```

---

## Project Structure

```
app/
├── assets/
│   └── css/main.css          # Global styles
├── components/
│   └── NotificationBell.vue  # Topbar notification bell
├── composables/
│   ├── useApi.js             # API client with auth token
│   └── usePermission.js      # Permission check helper
├── layouts/
│   ├── dashboard.vue         # Main dashboard layout with sidebar
│   └── blank.vue             # Blank layout for login
├── middleware/
│   ├── auth.js               # Redirect to login if not authenticated
│   └── guest.js              # Redirect to dashboard if authenticated
├── pages/
│   ├── login.vue
│   ├── dashboard/
│   ├── students/
│   ├── faculty/
│   ├── courses/
│   ├── enrollments/
│   ├── attendance/
│   ├── exams/
│   ├── grades/
│   ├── fees/
│   ├── admissions/
│   ├── library/
│   ├── timetable/
│   ├── notifications/
│   ├── reports/
│   ├── settings/
│   └── profile/
├── plugins/
│   ├── api.client.js         # $api plugin
│   └── pinia.js              # Pinia initialization
└── stores/
    ├── auth.js               # Authentication state
    └── ui.js                 # UI state (sidebar, page title)
```

---

## Key Design Decisions

- **SSR disabled** (`ssr: false`) — runs as pure SPA, safe to use `localStorage`
- **No Nuxt UI modals** — all modals use plain HTML with `<Teleport to="body">` to avoid z-index conflicts
- **Autocomplete disabled** — all form inputs use `autocomplete="new-password"` to prevent browser autofill
- **Token auth** — Bearer token stored in `localStorage`, injected into every API request
- **Role-based nav** — sidebar items filtered by user permissions

---

## Deployment

### Vercel (Recommended for frontend)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set environment variable:
   - `NUXT_PUBLIC_API_BASE` = `https://your-backend.onrender.com/api`
4. Build settings are auto-detected via `vercel.json`

### Manual build

```bash
# Generate static files
pnpm run generate

# Output is in .output/public/
# Deploy to any static hosting (Netlify, GitHub Pages, etc.)
```

---

## License

MIT License — feel free to use for educational purposes.