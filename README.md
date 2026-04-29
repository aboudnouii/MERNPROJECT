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

For Render, use:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Set these Render environment variables:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/repairmanager?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=change_this_to_a_long_random_secret
```

## Frontend Setup

```bash
cd frontend
npm install --legacy-peer-deps
npm install ajv@8 ajv-keywords@5 --save-dev
npm start
```

Open:

```text
http://localhost:3000
```

For Vercel, use:

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: build
```

Set this Vercel environment variable:

```env
REACT_APP_API_URL=https://mernproject-12kg.onrender.com/api
```
