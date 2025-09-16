import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

import alertsRoute from "./routes/alertsRoute.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.use(express.json());
app.use(rateLimiter);

app.use("/api/alerts", alertsRoute);

// Test endpoint
app.get("/api/test", (req, res) => {
    res.json({ message: "Backend is working!", timestamp: new Date().toISOString() });
});

initDB().then(() => {
    const PORT = process.env.PORT || 5000;
    const HOST = '0.0.0.0'; // Listen on all network interfaces
    app.listen(PORT, HOST, () => {
      console.log(`Server is running on http://${HOST}:${PORT}`);
      console.log(`Local access: http://localhost:${PORT}`);
      console.log(`Network access: http://192.168.110.214:${PORT}`);
    });
}).catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
});