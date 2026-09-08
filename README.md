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
- **Task Priority Levels**: Color-coded priority badges (`Low`, `Medium`, 🔥 `High Priority`).
- **Due Dates & Time Badges**: Smart deadline tracking badges with time support (⚠️ `Overdue`, ⏳ `Due Today`, 📅 `Due <Date> at <Time>`).
- **Category Tags / Labels**: Customizable category pills (`#Frontend`, `#Backend`, `#Bug`, `#Feature`, `#Design`, `#DevOps`).
- **Board Sorting Controls**: Dynamic sorting by **Newest**, **Due Date (Earliest)**, or **Priority (Highest)**.
- **Task Claiming & Assignment**:
  - Normal users can create tasks and claim unassigned tasks exclusively for themselves.
  - Admins can reassign tasks between any user across the entire workspace via interactive task card controls.

### 📱 3. Fully Mobile Responsive UX & Feedback
- **Mobile Bottom Navigation Bar**: 1-tap switching between Board, Users Directory, and Profile on smartphone viewports (`< 640px`).
- **Mobile Column View Switcher**: Interactive column tabs (`[ All Columns ] [ To Do ] [ Doing ] [ Done ]`) for focused mobile viewing.
- **Mobile User Cards**: Stacked user card views replacing heavy tables on mobile devices.

---

## 🌟 Optional Bonus Features & Enhancements

Beyond the core required features, the application implements the following value-add bonus enhancements:

1. 🏷️ **Task Priority Levels**:
   - Color-coded priority badges on task cards (`Low`, `Medium`, 🔥 `High Priority`).
   - Priority level selector in task modal with backend schema validation.

2. 📅 **Task Due Dates & Time Selection**:
   - Native `datetime-local` picker for selecting both calendar date and exact time.
   - Dynamic deadline tracking badges on cards:
     - ⚠️ **Overdue Alert**: Red pulsing badge displaying overdue date and time.
     - ⏳ **Due Today**: Amber alert badge displaying exact due time.
     - 📅 **Upcoming**: Indigo calendar pill displaying target date & time.

3. 🏷️ **Custom Category Tags / Labels**:
   - Interactive category tags (`#Frontend`, `#Backend`, `#Bug`, `#Feature`, `#Design`, `#DevOps`).
   - Color-coded tag pills rendered on task cards and selectable in the modal.

4. 🔃 **Board Sorting Controls**:
   - Dynamic sorting dropdown to re-order Kanban columns instantly by:
     - 🕒 **Newest** (Default creation order)
     - 📅 **Due Date** (Earliest deadline first)
     - 🔥 **Priority** (Highest priority first)

5. 🎨 **Bespoke Glassmorphic Custom Dropdowns**:
   - Replaced default browser `<select>` dropdowns with an animated custom popover component ([`CustomDropdown.tsx`](file:///c:/Users/GIMINDU/Videos/Projects/TaskGimi/frontend/src/components/CustomDropdown.tsx)).
   - Features animated `ChevronDown` arrow rotation, active item checkmarks (`Check` icon), and click-outside dismissal.

6. 🔔 **Real-Time Interactive Toast Notification System**:
   - App-wide popover toasts ([`ToastContext.tsx`](file:///c:/Users/GIMINDU/Videos/Projects/TaskGimi/frontend/src/context/ToastContext.tsx)) with 4 distinct alert states (`Success`, `Error`, `Info`, `Warning`).
   - Real-time feedback for task creation, DND status movement, claims, reassignments, deletions, and admin user account approvals.

7. 📍 **Floating Action Button (FAB) for Task Creation**:
   - Ergonomic bottom-right floating button (`fixed bottom-20 sm:bottom-8 right-6 z-40`) with hover rotation and glowing amber focus ring.

8. 🔐 **Admin User Registration Approval Workflow**:
   - Security authorization workflow where newly registered normal user accounts default to a pending approval state (`isApproved: false`).
   - Dedicated **User Directory** ([`/admin/users`](file:///c:/Users/GIMINDU/Videos/Projects/TaskGimi/frontend/src/app/admin/users/page.tsx)) where administrators can review, approve (`PATCH /api/users/:id/approve`), or decline/remove (`DELETE /api/users/:id`) user accounts.
   - Pending accounts are strictly blocked from logging in by backend authentication middleware until approved by an administrator.

9. 📊 **Interactive Workspace Analytics & Stats Overview**:
   - Visual metrics overview cards ([`StatsOverview.tsx`](file:///c:/Users/GIMINDU/Videos/Projects/TaskGimi/frontend/src/components/StatsOverview.tsx)) displaying live counts for Total Tasks, Active In-Progress Tasks, Completed Tasks, and Total Assignees.

10. 🛡️ **Database Connection Resiliency & In-Memory Fallback**:
    - Primary MongoDB Atlas Cloud connection configured with automatic zero-config fallback to `mongodb-memory-server` ([`db.ts`](file:///c:/Users/GIMINDU/Videos/Projects/TaskGimi/backend/src/config/db.ts)) if offline or cloud database connection is unavailable during evaluation testing.

11. 📱 **Mobile-First Responsive Navigation & Column Switcher**:
    - Dedicated mobile bottom navigation bar (`< 640px`) for 1-tap switching between Board, User Directory, and Profile views.
    - Single-column switcher tabs (`[ All Columns ] [ To Do ] [ Doing ] [ Done ]`) for focused mobile viewing.

12. 👤 **Interactive User Profile Page**:
    - Dedicated Profile view ([`/profile`](file:///c:/Users/GIMINDU/Videos/Projects/TaskGimi/frontend/src/app/profile/page.tsx)) displaying user account statistics, role badges, registration date, and session controls.

13. 📁 **Project / Workspace Selection Tag**:
    - Assign tasks to specific project workspaces (`TaskGimi Workspace`, `Mobile Client App`, `Backend API`, `Marketing & Design`, `General`).
    - Color-highlighted project folder badges (`📁 Project Name`) rendered on task cards.

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
