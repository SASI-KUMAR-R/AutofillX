const mongoose = require("mongoose");

const FormSchema = new mongoose.Schema({
    url: { type: String, required: true, unique: true },
    structure: { type: Array, default: [] }
});

module.exports = mongoose.model("Form", FormSchema);
