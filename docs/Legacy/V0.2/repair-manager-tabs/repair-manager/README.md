# Repair Manager - MERN Stack Application

Repair Manager is a complete MERN stack web application for an auto repair shop / car garage. It follows the same structure as a Task Manager application, adapted for vehicle repair jobs.

## Features

- Add a new repair job
- View all repair jobs
- Edit an existing repair job
- Delete a repair job
- Mark a repair job as completed
- Filter by status
- Search by customer name, license plate, or car model
- Dashboard statistics
- Days in garage calculation

## Project Structure

```text
repair-manager/
├── backend/
│   ├── server.js
│   ├── models/
│   │   └── RepairJob.js
│   ├── routes/
│   │   └── repairRoutes.js
│   ├── .env
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── RepairForm.js
│   │   │   ├── RepairItem.js
│   │   │   └── RepairList.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── styles.css
│   └── package.json
└── report.md
```

## Backend API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/repairs` | Create a new repair job |
| GET | `/api/repairs` | Get all repair jobs |
| GET | `/api/repairs/:id` | Get one repair job |
| PUT | `/api/repairs/:id` | Update a repair job |
| DELETE | `/api/repairs/:id` | Delete a repair job |
| PATCH | `/api/repairs/:id/complete` | Mark repair job as completed |

## How to Run

### 1. Start MongoDB

Make sure MongoDB is installed and running locally.

Default database URL:

```bash
mongodb://localhost:27017/repairmanager
```

### 2. Run Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

### 3. Run Frontend

Open another terminal:

```bash
cd frontend
npm install
npm start
```

Frontend runs on:

```text
http://localhost:3000
```

## Example Test Data

```json
{
  "customerName": "Ahmed Mansouri",
  "phoneNumber": "0555123456",
  "carModel": "Hyundai Tucson 2022",
  "licensePlate": "16-123-456",
  "issueDescription": "Check engine light on",
  "estimatedCost": 350
}
```

## Notes

- Backend uses Express, Mongoose, CORS, and dotenv.
- Frontend uses React and Axios.
- Data persists in MongoDB.
