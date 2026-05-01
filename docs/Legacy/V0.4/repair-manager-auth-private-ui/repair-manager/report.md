# Repair Manager MERN Report

## Introduction

Repair Manager is a MERN stack web application designed for an auto repair shop. It extends the standard Task Manager practical work into a realistic garage management system.

## MERN Architecture

The application uses React for the frontend, Express and Node.js for the backend API, and MongoDB for data persistence. Communication between frontend and backend is handled through REST API requests using Axios.

## Authentication

The system includes JWT-based login and signup. Users create an account using name, email, and password. Passwords are hashed with bcrypt before being stored in MongoDB. After login, the backend returns a JWT token. The frontend stores it in localStorage and sends it in the Authorization header for protected repair job requests.

## Backend

The backend includes:

- User model
- RepairJob model
- Auth routes
- Repair routes
- Auth middleware
- MongoDB connection

## Frontend

The frontend includes:

- Login/signup screen
- Tab-based dashboard
- Repair job form
- Repair list and item cards
- Search and status filtering
- Dashboard statistics

## Security

The system protects repair data using JWT authentication. Repair API routes cannot be accessed without a valid token. Passwords are never stored as plain text.

## Conclusion

The final application provides full repair job management with authentication, persistent data storage, and a clean React user interface.
