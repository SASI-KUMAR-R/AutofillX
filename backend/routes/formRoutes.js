const express = require("express");
const Form = require("../models/Form");
const router = express.Router();


router.post("/store", async (req, res) => {
    try {
        const { url, fields } = req.body;
        if (!url || !fields || fields.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid form data" });
        }

        let form = await Form.findOne({ url });
        if (!form) {
            form = new Form({ url, fields });
            await form.save();
            return res.json({ success: true, message: "Form stored successfully", form });
        }

        res.json({ success: false, message: "Form already exists" });
    } catch (error) {
        console.error("Error storing form:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;



