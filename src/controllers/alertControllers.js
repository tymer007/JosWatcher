import { sql } from "../config/db.js";

export async function createAlert(req, res) {
  try {
    const {
      user_id,
      title,
      description,
      location,
      coordinates,
      type,
      time,
    } = req.body;

    if (!user_id || !title || !description || !location || !time || !coordinates) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const alert = await sql`
        INSERT INTO alerts (user_id, title, description, location, coordinates, type, time)
        VALUES (${user_id}, ${title}, ${description}, ${location}, ${coordinates}, ${type}, ${time})
        RETURNING *
        `;
    return res.status(201).json({ message: "Alert created successfully", alert });
  } catch (error) {
    console.log("Error creating alert", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAlertsByUserId(req, res) {
    try {
        const { userId } = req.params;
        const alerts = await sql`
        SELECT * FROM alerts WHERE user_id = ${userId} ORDER BY createdAt DESC 
        `;
        return res.status(200).json(alerts);
    } catch (error) {
        console.log("Error getting alerts", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteAlertbyId(req, res) {
    try {
        const { alertId } = req.params;

        if(isNaN(parseInt(alertId))) {
            return res.status(400).json({ message: "Invalid alert ID" });
        }

        const alert = await sql`
        DELETE FROM alerts WHERE id = ${alertId} RETURNING *
        `;
 
        if (alert.length === 0) {
            return res.status(404).json({ message: "Alert not found" });
        }

        return res.status(200).json({ message: "Alert deleted successfully" });
    } catch (error) {
        console.log("Error deleting alert", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getAllAlerts(req, res) {
    try {
        const alerts = await sql`
        SELECT * FROM alerts ORDER BY createdAt DESC 
        `;
        return res.status(200).json(alerts);
    } catch (error) {
        console.log("Error getting all alerts", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}