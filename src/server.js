import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import job from "./config/cron.js";

import alertsRoute from "./routes/alertsRoute.js";

dotenv.config();

const app = express();

if(process.env.NODE_ENV === "production") job.start();

// Middleware
app.use(express.json());
app.use(cors());

app.use(express.json());
app.use(rateLimiter);

app.use("/api/alerts", alertsRoute);

app.get("/api/health", (req, res) => {
    res.status(200).json({ message: "Backend is working!", timestamp: new Date().toISOString() });
});

initDB().then(() => {
    const PORT = process.env.PORT || 5000;
    const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
    app.listen(PORT, HOST, () => {
      console.log(`Server is running on http://${HOST}:${PORT}`);
      if (process.env.NODE_ENV !== "production") {
        console.log(`Local access: http://localhost:${PORT}`);
      }
    });
}).catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
});