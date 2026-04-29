const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const repairRoutes = require("./routes/repairRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/repairmanager";
const DEFAULT_CLIENT_URLS = [
  "http://localhost:3000",
  "https://mernproject-ibnbiskra-8184s-projects.vercel.app",
  "https://mernproject-lb9oq98wb-ibnbiskra-8184s-projects.vercel.app",
];

const allowedClientUrls = new Set(
  (process.env.CLIENT_URLS || process.env.CLIENT_URL || DEFAULT_CLIENT_URLS.join(","))
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean)
);

function isAllowedVercelPreview(origin) {
  try {
    const { hostname } = new URL(origin);
    return /^mernproject(-[a-z0-9]+)?-ibnbiskra-8184s-projects\.vercel\.app$/.test(hostname);
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const cleanOrigin = origin.replace(/\/+$/, "");
      if (allowedClientUrls.has(cleanOrigin) || isAllowedVercelPreview(cleanOrigin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Repair Manager API is running");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/repairs", repairRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    if (err.reason) {
      console.error("MongoDB connection reason:", err.reason);
    }
    process.exit(1);
  });
