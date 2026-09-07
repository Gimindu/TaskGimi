# 🎯 Less Task - Full-Stack Trello-like Task Management System

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://task-gimi.vercel.app/)
[![API Status](https://img.shields.io/badge/Backend_API-Render-46E3B7?style=for-the-badge&logo=render)](https://taskgimi.onrender.com/api/health)
[![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-amber.svg?style=for-the-badge)](LICENSE)

> A modern, responsive full-stack Trello-like Kanban task management application built with **Next.js 14**, **Node.js/Express**, **TypeScript**, **MongoDB Atlas**, and **Tailwind CSS**. Built around strict Role-Based Access Control (RBAC), drag-and-drop task movement, approval workflows, and mobile responsiveness.

---

## 🌐 Live Application & Credentials

- **Live Deployed Web Application**: [https://task-gimi.vercel.app/](https://task-gimi.vercel.app/)
- **Live Deployed Backend API**: [https://taskgimi.onrender.com/api](https://taskgimi.onrender.com/api)
- **API Health Check**: [https://taskgimi.onrender.com/api/health](https://taskgimi.onrender.com/api/health)

### 🔑 Test Credentials

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@taskgimi.com` | `Admin@123456` | Full system control, reassign any task, approve/decline user accounts, view user directory |
| **Normal User** | `jane@example.com` | `Password123` | Create tasks, claim unassigned tasks to self, edit/delete own tasks |

---

## ✨ Core Features & Requirements Audit

### 🔐 1. Role-Based Access Control (RBAC) & Authentication
- **Admin Seeding Script**: Administrator accounts cannot be registered via public signup. Created via script `npm run seed:admin` (`src/scripts/seedAdmin.ts`).
- **Normal User Registration & Approval Workflow**: New user registrations require admin approval before login access is granted.
- **Secure Authentication**: Passwords hashed using `bcryptjs` with JWT token validation enforced on all protected API endpoints.

### 📋 2. Task Management & Drag-and-Drop Board
- **Three Status Columns**: `To Do` (Amber), `Doing` (Blue), and `Done` (Green).
- **Drag-and-Drop**: Interactive card movement powered by `@hello-pangea/dnd`. Dragged status changes instantly persist to MongoDB.
- **Task Claiming & Assignment**:
  - Normal users can create tasks and claim unassigned tasks exclusively for themselves.
  - Admins can reassign tasks between any user across the entire workspace via interactive task card controls.

### 📱 3. Fully Mobile Responsive UX
- **Mobile Bottom Navigation Bar**: 1-tap switching between Board, Users Directory, and Profile on smartphone viewports (`< 640px`).
- **Mobile Column View Switcher**: Interactive column tabs (`[ All Columns ] [ To Do ] [ Doing ] [ Done ]`) for focused mobile viewing.
- **Mobile User Cards**: Stacked user card views replacing heavy tables on mobile devices.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, `@hello-pangea/dnd`, Axios
- **Backend**: Node.js, Express.js, TypeScript, Mongoose (MongoDB ODM), JWT (`jsonwebtoken`), `bcryptjs`, CORS
- **Database**: MongoDB Atlas (Cloud Database)
- **Deployment**: Vercel (Frontend CDN), Render (Backend Web Service)

---

## 📁 Repository Structure

```text
TaskGimi/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB Atlas Connection
│   │   ├── middleware/      # JWT Authentication & RBAC Authorization
│   │   ├── models/          # Mongoose User & Task Schemas
│   │   ├── routes/          # REST API Routes (Auth, Tasks, Users)
│   │   └── scripts/         # Admin Seeding Script (seedAdmin.ts)
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router Entrypoints
│   │   ├── components/      # Reusable UI & Page View Components
│   │   │   └── pages/       # LandingPageView, DashboardView, ProfileView, etc.
│   │   ├── context/         # AuthContext state provider
│   │   ├── lib/             # Axios API Client configuration
│   │   └── types/           # TypeScript Interfaces & Types
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js `v18.x` or higher
- MongoDB instance (Local or MongoDB Atlas connection URI)

### 1. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` based on `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/taskgimi
JWT_SECRET=your_super_secret_jwt_key
ADMIN_NAME=System Administrator
ADMIN_EMAIL=admin@taskgimi.com
ADMIN_PASSWORD=Admin@123456
```

Seed the Admin account:
```bash
npm run seed:admin
```

Start backend development server:
```bash
npm run dev
```
Backend will run at `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env.local` file in `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start frontend development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 REST API Reference

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` - Register a new normal user account (Pending approval status)
- `POST /api/auth/login` - Log in with email & password, returns JWT token + user profile
- `GET /api/auth/me` - Fetch currently authenticated user profile

### Task Routes (`/api/tasks`)
- `GET /api/tasks` - Fetch all tasks (Filtered by role/permissions)
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update task details
- `PATCH /api/tasks/:id/status` - Update task status (`To Do` -> `Doing` -> `Done`)
- `PATCH /api/tasks/:id/assign` - Assign or reassign task
- `DELETE /api/tasks/:id` - Delete a task

### User Routes (`/api/users`)
- `GET /api/users` - Get all users list
- `PATCH /api/users/:id/approve` - Approve pending user account (Admin only)
- `DELETE /api/users/:id` - Decline or remove user account (Admin only)

---

## 📄 License
This project is licensed under the MIT License.
