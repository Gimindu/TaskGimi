# 🎯 Less Task - Full-Stack Trello-like Task Management System

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://task-gimi.vercel.app/)
[![API Status](https://img.shields.io/badge/Backend_API-Render-46E3B7?style=for-the-badge&logo=render)](https://taskgimi.onrender.com/api/health)
[![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-amber.svg?style=for-the-badge)](LICENSE)

> A modern, responsive full-stack Trello-like Kanban task management application built with **Next.js 14**, **Node.js/Express**, **TypeScript**, **MongoDB Atlas**, and **Tailwind CSS**. Built around strict Role-Based Access Control (RBAC), drag-and-drop task movement, optimistic UI updates, client-side caching with 8-second silent background polling, and mobile responsiveness.

---

## 🌐 Live Application & Credentials

- **Live Deployed Web Application**: [https://task-gimi.vercel.app/](https://task-gimi.vercel.app/)
- **Live Deployed Backend API**: [https://taskgimi.onrender.com/api](https://taskgimi.onrender.com/api)
- **API Health Check**: [https://taskgimi.onrender.com/api/health](https://taskgimi.onrender.com/api/health)

### 🔑 Test Credentials

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@taskgimi.com` | `Admin@123456` | Full system control, edit/delete any task, reassign tasks, approve/decline user accounts, view user directory |
| **Normal User** | `jane@example.com` | `Password123` | Create tasks, claim unassigned tasks to self, edit/delete own tasks, update assigned task status |

---

## ✨ Core Features & Architecture Highlights

### 🔐 1. Role-Based Access Control (RBAC) & Permissions
- **Admin Seeding Script**: Administrator accounts cannot be registered via public signup. Created via script `npm run seed:admin` (`src/scripts/seedAdmin.ts`).
- **Normal User Registration & Approval Workflow**: New user registrations require admin approval before login access is granted (`isApproved: false` default).
- **Admin Task Creation Protection**: When an Admin creates a task and assigns it to a member:
  - Task details (Title, Description, Priority, Due Date, Project, Assignee, Tags) become **read-only** for assigned members.
  - Assigned members can **only update the status** (`To Do` -> `In Progress` -> `Done`).
  - Task deletion is restricted to Administrators or the Task Creator.
- **Secure Authentication**: Passwords hashed using `bcryptjs` with JWT token validation enforced on all protected API endpoints.

### 📋 2. Task Management & Drag-and-Drop Board
- **Three Status Columns**: `To Do` (Amber), `In Progress` (Sky Blue), and `Done` (Emerald).
- **Drag-and-Drop**: Interactive card movement powered by `@hello-pangea/dnd`. Dragged status changes instantly persist to MongoDB.
- **Task Priority Levels**: Color-coded priority badges (`Low`, `Medium`, 🔥 `High Priority`).
- **High-Visibility Overdue Deadlines**:
  - Overdue tasks are highlighted with glowing crimson borders (`border-l-4 border-l-rose-500 bg-rose-950/25 ring-1 ring-rose-500/40`).
  - Pulsing warning badges (`⚠️ OVERDUE`) and alert icons for instant visual urgency.
- **Category Tags / Labels**: Customizable category pills (`#Frontend`, `#Backend`, `#Bug`, `#Feature`, `#Design`, `#DevOps`).
- **Dynamic Project Workspaces**: Type custom project names or click existing project chips populated dynamically from MongoDB task records.
- **Board Sorting Controls**: Dynamic sorting by **Newest**, **Due Date (Earliest)**, or **Priority (Highest)**.

### ⚡ 3. Client-Side Data Caching & Real-Time Sync
- **Client-Side Cache (`TaskContext.tsx`)**: Warm memory cache prevents redundant API calls on page transitions (e.g. switching between `/dashboard` and `/profile`).
- **Optimistic UI Updates**: All actions (status changes, task creation, editing, claiming, reassigning, and deleting) update the UI state instantly before background server syncing.
- **8-Second Silent Background Polling**: Periodically fetches live changes from MongoDB every 8 seconds without triggering page spinners or interrupting user workflow.
- **Window Focus Re-Fetching**: Auto-syncs workspace data as soon as the user returns to or switches focus back to the TaskGimi tab.

### 📱 4. Mobile Responsive UX & Navigation
- **Mobile Bottom Navigation Bar**: 1-tap switching between Board, Users Directory, and Profile on smartphone viewports (`< 640px`).
- **Mobile Column View Switcher**: Interactive column tabs (`[ All Columns ] [ To Do ] [ In Progress ] [ Done ]`) for focused mobile viewing.
- **Mobile User Directory Cards**: Stacked user card views replacing heavy data tables on mobile screens.

---

## 🌟 Optional Bonus Features & Enhancements

Beyond the core required features, the application implements the following value-add bonus enhancements:

1. ⚡ **Real-Time Client-Side Data Cache & Silent Background Sync**:
   - `TaskContext.tsx` provides zero-delay page navigation, optimistic UI updates, 8-second silent background polling, and tab focus re-fetching.

2. 🔒 **Admin-Created Task Detail Lock & RBAC Permissions**:
   - Tasks created by Admins and assigned to members are locked for editing details, permitting status updates (`To Do` -> `In Progress` -> `Done`) only.

3. ⚠️ **High-Visibility Overdue Deadline Highlights**:
   - Glowing crimson ambient card containers with pulsing `OVERDUE` alert badges and warning icons for instant deadline awareness.

4. 🔐 **Admin User Approval Workflow**:
   - Newly registered user accounts default to `isApproved: false` until approved by an administrator in the User Directory ([`/admin/users`](file:///c:/Users/GIMINDU/Videos/Projects/TaskGimi/frontend/src/app/admin/users/page.tsx)).

5. 📁 **Custom Workspace Project Chips**:
   - Editable custom project text field with dynamic chip selection collected automatically from existing MongoDB project names.

6. 🔃 **Board Sorting Controls**:
   - Dynamic sorting of Kanban board columns by **Newest**, **Due Date (Earliest)**, or **Priority (Highest)**.

7. 🛡️ **In-Memory Database Fallback**:
   - Primary MongoDB Atlas Cloud connection configured with automatic fallback to `mongodb-memory-server` ([`db.ts`](file:///c:/Users/GIMINDU/Videos/Projects/TaskGimi/backend/src/config/db.ts)) if cloud database is offline.

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
│   │   ├── config/          # MongoDB Atlas Connection & In-Memory Fallback
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
│   │   │   └── pages/       # LandingPageView, DashboardView, ProfileView, AdminUsersView
│   │   ├── context/         # AuthContext, ToastContext, TaskContext (Client Cache)
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

Create a `.env` file in `backend/`:
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
- `POST /api/auth/register` - Register a new normal user account (Pending approval)
- `POST /api/auth/login` - Log in with email & password, returns JWT token + user profile
- `GET /api/auth/me` - Fetch currently authenticated user profile

### Task Routes (`/api/tasks`)
- `GET /api/tasks` - Fetch all tasks (Filtered by role/permissions)
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update task details (Restricted to Admin or Task Creator)
- `PATCH /api/tasks/:id/status` - Update task status (`To Do` -> `Doing` -> `Done`)
- `PATCH /api/tasks/:id/assign` - Assign or reassign task
- `DELETE /api/tasks/:id` - Delete a task (Restricted to Admin or Task Creator)

### User Routes (`/api/users`)
- `GET /api/users` - Get all users list
- `PATCH /api/users/:id/approve` - Approve pending user account (Admin only)
- `DELETE /api/users/:id` - Decline or remove user account (Admin only)

---

## 📄 License
This project is licensed under the MIT License.
