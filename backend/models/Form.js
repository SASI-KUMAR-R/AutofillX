const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema({
    label: { type: String, default: ""},
    type: { type: String, default: "" },
    name: { type: String, default: ""},
    placeholder: { type: String, default: "" },  // Default empty string for consistency
    value: { type: String, default: "" }, 
    required: { type: Boolean, default: false }  // New field: Helps identify mandatory fields
});

const formSchema = new mongoose.Schema({
    url: { type: String, required: true, unique: true, index: true }, // Indexing for faster queries
    fields: [fieldSchema] 
}, { timestamps: true });

const Form = mongoose.model("AutoFillStructure", formSchema);
module.exports = Form;
