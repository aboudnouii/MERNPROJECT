# Short Report: Repair Manager MERN Architecture

## 1. Introduction

Repair Manager is a full-stack web application designed for an auto repair shop. The application allows garage staff to manage vehicle repair jobs by adding, viewing, editing, deleting, and completing repair tickets.

The project follows the MERN architecture:

```text
React Frontend → Express / Node.js Backend API → MongoDB Database
```

## 2. MongoDB Database

MongoDB stores repair job documents in a NoSQL collection. Each repair job includes customer information, vehicle details, issue description, repair status, estimated cost, actual cost, creation date, and completion date.

The main model is `RepairJob` and contains:

- customerName
- phoneNumber
- carModel
- licensePlate
- issueDescription
- status
- estimatedCost
- actualCost
- createdAt
- completedAt

## 3. Express.js and Node.js Backend

The backend is built with Node.js and Express.js. It exposes a REST API under `/api/repairs`.

The backend responsibilities are:

- Connect to MongoDB using Mongoose
- Define the RepairJob schema
- Provide RESTful API routes
- Handle CRUD operations
- Mark jobs as completed
- Return JSON responses to the frontend

## 4. React Frontend

The frontend is built with React. It provides an interface where users can:

- Add a repair job using a form
- View repair jobs as cards
- Edit an existing repair job
- Delete a repair job
- Mark a job as completed
- Filter jobs by status
- Search by customer name, car model, or license plate
- View simple dashboard statistics

Axios is used to send HTTP requests from React to the Express backend.

## 5. Communication Flow

When the user performs an action in the frontend, React sends an HTTP request to the backend API.

Examples:

- Adding a job sends a `POST` request to `/api/repairs`
- Loading jobs sends a `GET` request to `/api/repairs`
- Editing a job sends a `PUT` request to `/api/repairs/:id`
- Deleting a job sends a `DELETE` request to `/api/repairs/:id`
- Completing a job sends a `PATCH` request to `/api/repairs/:id/complete`

The backend processes the request, updates MongoDB, and returns the updated data to the frontend.

## 6. Conclusion

Repair Manager demonstrates a complete MERN stack application with full CRUD functionality and frontend-backend communication. It adapts the Task Manager practical work structure into a real-world garage repair management system.
