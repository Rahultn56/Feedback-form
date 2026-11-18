# Feedback Form with MongoDB Integration

A full-stack Feedback Form application built with **Node.js**, **Express**, and **MongoDB (Mongoose)**, featuring RESTful API endpoints and a responsive user interface.

---

## 🚀 Features

- **MongoDB Database Integration**: Automatically creates and persists feedback records using Mongoose.
- **REST API Endpoints**:
  - `POST /api/feedback` - Validate and save new feedback documents to MongoDB.
  - `GET /api/feedback` - Retrieve all stored feedback records sorted newest first.
  - `DELETE /api/feedback/:id` - Remove feedback by document ID.
  - `GET /api/health` - Inspect backend and database connection status.
- **Data Validation & Schema**: Enforces required fields (`name`, `email`, `message`), star ratings (`1 - 5`), categories, and timestamps.
- **Flexible Frontend**:
  - Serves an interactive standalone UI directly via Express at `http://localhost:5000`.
  - Supports modern React + Vite frontend in `src/`.

---

## 📦 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Local or MongoDB Atlas)
- **ODM**: Mongoose
- **Frontend**: HTML5 / React + Vite
- **Utilities**: CORS, Body-Parser, Dotenv

---

## 🛠️ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Rahultn56/Feedback-form.git
cd Feedback-form
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
PORT=5000

# Local MongoDB:
MONGODB_URI=mongodb://127.0.0.1:27017/feedback_db

# Or MongoDB Atlas Cloud:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/feedback_db?retryWrites=true&w=majority
```

### 4. Run the Server
```bash
# Standard run
node server.js

# Or development mode with auto-reload
npm run dev:server
```

Once started, open your browser and visit:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 🌐 API Documentation

### 1. Submit Feedback
- **Method**: `POST`
- **Endpoint**: `/api/feedback`
- **Headers**: `Content-Type: application/json`
- **Payload Example**:
```json
{
  "name": "Rahul",
  "email": "rahul@example.com",
  "rating": 5,
  "category": "Praise",
  "message": "Excellent feedback form and MongoDB integration!"
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Feedback received and saved to MongoDB successfully!",
  "data": {
    "_id": "673b88e14f9d2a...",
    "name": "Rahul",
    "email": "rahul@example.com",
    "rating": 5,
    "category": "Praise",
    "message": "Excellent feedback form and MongoDB integration!",
    "createdAt": "2026-11-18T17:00:00.000Z",
    "updatedAt": "2026-11-18T17:00:00.000Z"
  }
}
```

### 2. Fetch Stored Feedback
- **Method**: `GET`
- **Endpoint**: `/api/feedback`
- **Response**: List of all feedback records sorted from newest to oldest.

---

## 🗄️ MongoDB Schema Definition

```javascript
const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    category: { type: String, enum: ["General", "Suggestion", "Bug Report", "Praise"], default: "General" },
    message: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);
```

---

## ☁️ Setting up MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create an **M0 (Free)** cluster.
3. Under **Database Access**, create a database user and password.
4. Under **Network Access**, add IP `0.0.0.0/0` to allow connection.
5. Click **Connect -> Drivers -> Node.js**, copy the connection string, and set it as `MONGODB_URI` in your `.env` file.
