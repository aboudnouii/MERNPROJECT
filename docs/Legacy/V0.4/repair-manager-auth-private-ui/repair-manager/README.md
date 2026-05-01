# Repair Manager MERN

A full MERN stack web application for an auto repair shop / car garage. It includes repair job CRUD, tabs, dashboard, search/filter, and JWT login/signup authentication.

## Features

- User signup
- User login
- JWT protected repair API
- Add repair jobs
- View all repair jobs
- Edit repair jobs
- Delete repair jobs
- Mark jobs as completed
- Dashboard statistics
- Status filter and search
- Tab-based React interface

## Project Structure

```text
repair-manager/
├── backend/
│   ├── server.js
│   ├── models/
│   │   ├── RepairJob.js
│   │   └── User.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── repairRoutes.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── AuthForm.jsx
    │   │   ├── RepairForm.jsx
    │   │   ├── RepairItem.jsx
    │   │   └── RepairList.jsx
    │   ├── App.jsx
    │   ├── index.js
    │   └── styles.css
    └── package.json
```

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create `.env` from `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/repairmanager
JWT_SECRET=change_this_to_a_long_random_secret
```

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

Open:

```text
http://localhost:3000
```

## Important

Because repair routes are protected, you must create an account or login before using the dashboard.

## API Routes

### Auth

- POST `/api/auth/signup`
- POST `/api/auth/login`
- GET `/api/auth/me`

### Repairs

All repair routes require an Authorization header:

```text
Authorization: Bearer YOUR_TOKEN
```

- POST `/api/repairs`
- GET `/api/repairs`
- GET `/api/repairs/:id`
- PUT `/api/repairs/:id`
- DELETE `/api/repairs/:id`
- PATCH `/api/repairs/:id/complete`
