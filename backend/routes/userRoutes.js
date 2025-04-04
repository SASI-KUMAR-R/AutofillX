const express = require("express");
const User = require("../models/UserData");
const router = express.Router();



router.post("/signin", async (req, res) => {
   
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email required" });

        let user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, "i") } });

        if (!user) {
            user = new User({ email, details: {} }); 
            await user.save();
        }

        console.log("User saved:", user);
        res.json({ success: true, message: "User signed in", user });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});






router.post("/getDetails", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});



router.post("/updateDetails", async (req, res) => {
    const { email, details } = req.body;

    if (!email || !details || typeof details !== "object") {
        return res.status(400).json({ success: false, message: "Email and details are required" });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        
        for (const [key, value] of Object.entries(details)) {
            user.details.set(key, value);
        }

        await user.save();

        res.status(200).json({ success: true, message: "Details updated successfully" });
    } catch (error) {
        console.error("Error updating user details:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});



module.exports = router;
