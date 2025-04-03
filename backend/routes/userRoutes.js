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



module.exports = router;
