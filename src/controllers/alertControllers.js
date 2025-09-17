import { sql } from "../config/db.js";

export async function createAlert(req, res) {
  try {
    console.log("📥 Backend received request body:", JSON.stringify(req.body, null, 2));
    
    const {
      user_id,
      description,
      location,
      coordinates,
      type,
      isPublic,
      time,
    } = req.body;

    // Validate required fields
    if (!user_id || !description || !location || !coordinates || !type || isPublic === undefined) {
      console.log("❌ Missing required fields:", {
        user_id: !!user_id,
        description: !!description,
        location: !!location,
        coordinates: !!coordinates,
        type: !!type,
        isPublic: isPublic !== undefined
      });
      console.log("❌ Field values:", {
        user_id,
        description,
        location,
        coordinates,
        type,
        isPublic
      });
      return res.status(400).json({ message: "All fields are required" });
    }

    // Additional validation for coordinates
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      console.log("❌ Invalid coordinates format:", coordinates);
      return res.status(400).json({ message: "Coordinates must be an array with 2 elements [lat, lng]" });
    }

    // Valid alert types
    const validTypes = [
      'Theft', 'Accidents', 'Vandalism', 'Harassment', 'Assault', 
      'Burglary', 'Robbery', 'Suspicious Activity', 'Public Disturbance', 
      'Missing Person', 'Traffic Violations', 'Fire Incidents', 
      'Domestic Violence', 'Drug-Related Offenses', 'Kidnapping'
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        message: "Invalid alert type", 
        validTypes: validTypes 
      });
    }

    // Generate title as "{type} at {location}"
    const title = `${type} at ${location}`;
    
    // Set time to current timestamp (same as createdAt)
    const currentTime = new Date().toISOString();

    // Convert coordinates array to proper JSON format
    const coordinatesJson = coordinates ? JSON.stringify(coordinates) : null;

    const alert = await sql`
        INSERT INTO alerts (user_id, title, description, location, coordinates, type, time, isPublic)
        VALUES (${user_id}, ${title}, ${description}, ${location}, ${coordinatesJson}, ${type}, ${currentTime}, ${isPublic})
        RETURNING *
        `;
    return res.status(201).json({ message: "Alert created successfully", alert });
  } catch (error) {
    console.log("Error creating alert", error);
    
    // Handle specific enum errors
    if (error.code === '22P02' && error.message.includes('enum')) {
      return res.status(400).json({ 
        message: "Invalid enum value", 
        details: error.message,
        validTypes: [
          'Theft', 'Accidents', 'Vandalism', 'Harassment', 'Assault', 
          'Burglary', 'Robbery', 'Suspicious Activity', 'Public Disturbance', 
          'Missing Person', 'Traffic Violations', 'Fire Incidents', 
          'Domestic Violence', 'Drug-Related Offenses', 'Kidnapping'
        ]
      });
    }
    
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

export async function getPublicAlerts(req, res) {
    try {
        const alerts = await sql`
        SELECT * FROM alerts 
        WHERE isPublic = true 
        ORDER BY createdAt DESC 
        `;
        return res.status(200).json(alerts);
    } catch (error) {
        console.log("Error getting public alerts", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function handleAlert(req, res) {
    try {
        console.log("📥 Backend received handle alert request:", JSON.stringify(req.body, null, 2));
        
        const {
            alertId,
            userId,
            status,
            responseActionTaken
        } = req.body;

        // Validate required fields
        if (!alertId || !userId || !status || !responseActionTaken) {
            console.log("❌ Missing required fields:", {
                alertId: !!alertId,
                userId: !!userId,
                status: !!status,
                responseActionTaken: !!responseActionTaken
            });
            return res.status(400).json({ message: "alertId, userId, status, and responseActionTaken are required" });
        }

        // Validate alert ID
        if (isNaN(parseInt(alertId))) {
            return res.status(400).json({ message: "Invalid alert ID" });
        }

        // Check if user is admin
        const user = await sql`
            SELECT role FROM users WHERE user_id = ${userId}
        `;

        if (user.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user[0].role !== 'admin') {
            return res.status(403).json({ message: "Only admin users can handle alerts" });
        }

        // Validate status
        const validStatuses = ['pending', 'in progress', 'resolved', 'cancelled', 'escalated'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: "Invalid status", 
                validStatuses: validStatuses 
            });
        }

        // Check if alert exists
        const existingAlert = await sql`
            SELECT * FROM alerts WHERE id = ${alertId}
        `;

        if (existingAlert.length === 0) {
            return res.status(404).json({ message: "Alert not found" });
        }

        // Set current time for response time
        const responseTime = new Date().toISOString();

        // Update the alert
        const updatedAlert = await sql`
            UPDATE alerts 
            SET 
                status = ${status},
                responderId = ${userId},
                responseTime = ${responseTime},
                responseActionTaken = ${responseActionTaken},
                updatedAt = CURRENT_TIMESTAMP
            WHERE id = ${alertId}
            RETURNING *
        `;

        console.log("✅ Alert handled successfully:", updatedAlert[0]);
        return res.status(200).json({ 
            message: "Alert handled successfully", 
            alert: updatedAlert[0] 
        });

    } catch (error) {
        console.log("Error handling alert", error);
        
        // Handle specific enum errors
        if (error.code === '22P02' && error.message.includes('enum')) {
            return res.status(400).json({ 
                message: "Invalid status value", 
                validStatuses: ['pending', 'in progress', 'resolved', 'cancelled', 'escalated']
            });
        }
        
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getAlertTypes(req, res) {
    try {
        const result = await sql`
        SELECT unnest(enum_range(NULL::alert_type)) as alert_type
        `;
        const types = result.map(row => row.alert_type);
        return res.status(200).json({ alertTypes: types });
    } catch (error) {
        console.log("Error getting alert types", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

