const express = require("express");
const User = require("../models/UserData");
const router = express.Router();

router.post("/login", async (req, res) => {
  const { email } = req.body;
  let user = await User.findOne({ email });
  if (!user) user = await User.create({ email, details: {} });
  res.json(user);
});

router.post("/update", async (req, res) => {
  const { email, details } = req.body;
  await User.findOneAndUpdate({ email }, { details }, { new: true });
  res.json({ message: "User details updated!" });
});

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
