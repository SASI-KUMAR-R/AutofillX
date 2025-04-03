const express = require("express");
const Form = require("../models/Form");
const router = express.Router();

// structure exists
router.get("/get", async (req, res) => {
    const { url } = req.query;
    const form = await Form.findOne({ url });
    res.json(form || {});
});

// new form structure
router.post("/save", async (req, res) => {
    const { url, structure } = req.body;
    let form = await Form.findOne({ url });
    if (!form) form = await Form.create({ url, structure });
    res.json({ message: "Form structure saved!" });
});

module.exports = router;
