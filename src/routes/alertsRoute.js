import express from "express";
import { createAlert, getAlertsByUserId, deleteAlertbyId, getAllAlerts, getPublicAlerts, handleAlert, getAlertTypes } from "../controllers/alertControllers.js";

const router = express.Router();

router.post("/", createAlert);
router.put("/handle", handleAlert);
router.get("/", getAllAlerts);
router.get("/public", getPublicAlerts);
router.get("/types", getAlertTypes);
router.get("/:userId", getAlertsByUserId);
router.delete("/:alertId", deleteAlertbyId);

export default router;