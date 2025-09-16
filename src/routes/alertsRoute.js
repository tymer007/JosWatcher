import express from "express";
import { createAlert, getAlertsByUserId, deleteAlertbyId, getAllAlerts } from "../controllers/alertControllers.js";

const router = express.Router();

router.post("/", createAlert);
router.get("/", getAllAlerts);
router.get("/:userId", getAlertsByUserId);
router.delete("/:alertId", deleteAlertbyId);

export default router;