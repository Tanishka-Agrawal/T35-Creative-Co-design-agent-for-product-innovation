const express = require("express");
const cors = require("cors");

// Main routes file
const routes = require("./routes");

// OTP/Auth routes (inside Routes/ folder)
const authRoutes = require("./Routes/authRoutes");

const app = express();

app.use(
  cors({
    origin: "http://127.0.0.1:5500", // frontend
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// Normal API routes
app.use("/api", routes);

// OTP Authentication routes
app.use("/api/auth", authRoutes);

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});

