const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const authRoutes = require("./Routes/authRoutes");
require("dotenv").config();
require("./db");  // connects to MySQL

const app = express();

app.use(
  cors({
    origin: "http://127.0.0.1:5500",   // Live Server
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// Default API test
app.use("/api", routes);

// Authentication Routes (OTP, Login, Signup)
app.use("/api/auth", authRoutes);

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
