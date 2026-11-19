const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/feedback_db";

// ==========================================
// 1. Middleware
// ==========================================
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ==========================================
// 2. MongoDB Database Connection with Auto-Fallback
// ==========================================
async function connectDB() {
  // Try configured URI (e.g. MongoDB Atlas or local)
  const targetUri = process.env.MONGODB_URI || MONGODB_URI;
  try {
    console.log(`📡 Connecting to MongoDB at: ${targetUri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@")}`);
    await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 2500, // fast timeout if local daemon isn't running
    });
    console.log("✅ Successfully connected to MongoDB database!");
    return;
  } catch (err) {
    console.warn(`⚠️ Could not connect to ${targetUri} (${err.message})`);
  }

  // Automatic Fallback to In-Memory MongoDB
  console.log("🔄 Starting In-Memory MongoDB fallback server...");
  try {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log("✅ Connected successfully to In-Memory MongoDB server!");
    console.log(`📦 In-Memory MongoDB URI: ${memoryUri}`);
  } catch (memErr) {
    console.error("❌ MongoDB connection error:", memErr.message);
    console.log("👉 Tip: To connect to MongoDB Atlas Cloud, add your MONGODB_URI to .env");
  }
}

connectDB();

// ==========================================
// 3. Mongoose Feedback Schema & Model
// ==========================================
const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Minimum rating is 1"],
      max: [5, "Maximum rating is 5"],
      default: 5,
    },
    category: {
      type: String,
      enum: ["General", "Suggestion", "Bug Report", "Praise"],
      default: "General",
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

// ==========================================
// 4. API Endpoints
// ==========================================

// Health Check Route
app.get("/api/health", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: "online",
    message: "Feedback API Server is running",
    database: isConnected ? "Connected" : "Connecting/Disconnected",
    databaseHost: mongoose.connection.host || "unknown",
    databaseName: mongoose.connection.name || "feedback_db",
  });
});

// POST Route: Save incoming feedback into MongoDB
app.post("/api/feedback", async (req, res) => {
  try {
    const { name, email, rating, category, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required fields.",
      });
    }

    const newFeedback = new Feedback({
      name,
      email,
      rating: Number(rating) || 5,
      category: category || "General",
      message,
    });

    const savedFeedback = await newFeedback.save();
    console.log("📥 Saved new feedback to MongoDB:", savedFeedback._id);

    return res.status(201).json({
      success: true,
      message: "Feedback received and saved to MongoDB successfully!",
      data: savedFeedback,
    });
  } catch (error) {
    console.error("❌ Error saving feedback to MongoDB:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to save feedback to database.",
      error: error.message,
    });
  }
});

// GET Route: Retrieve all feedbacks from MongoDB (newest first)
app.get("/api/feedback", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error) {
    console.error("❌ Error retrieving feedbacks:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve feedbacks.",
      error: error.message,
    });
  }
});

// DELETE Route: Delete a feedback by ID
app.delete("/api/feedback/:id", async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }
    res.status(200).json({ success: true, message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 5. Start Server
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`👉 Open http://localhost:${PORT} in your browser to test the Feedback Form!`);
});
