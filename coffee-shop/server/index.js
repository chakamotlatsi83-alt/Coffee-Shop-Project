require("dotenv").config();
const express = require("express");
const cors = require("cors");
const redis = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// ---- CORS: only allow our own frontend(s) ----
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""));

app.use(
  cors({
    origin(origin, cb) {
      // allow tools like curl/Postman (no origin) and listed frontends
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// ---- Health check ----
app.get("/api/health", async (req, res) => {
  try {
    await redis.ping();
    res.json({ status: "ok", database: "connected", time: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ error: "Database not reachable" });
  }
});

// ---- Routes: teammates add theirs here ----
// app.use("/api/menu", require("./routes/menu"));      // Nkotsi
// app.use("/api/orders", require("./routes/orders"));  // Monica
// app.use("/api/auth", require("./routes/auth"));      // Monica

// ---- 404 + error handler (consistent error format) ----
app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
