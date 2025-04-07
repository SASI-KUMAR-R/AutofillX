const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema({
    label: { type: String, default: ""},
    type: { type: String, default: "" },
    name: { type: String, default: ""},
    placeholder: { type: String, default: "" },  
    value: { type: String, default: "" }, 
    required: { type: Boolean, default: false }  
});

const formSchema = new mongoose.Schema({
    url: { type: String, required: true, unique: true, index: true }, 
    fields: [fieldSchema] 
}, { timestamps: true });

const Form = mongoose.model("AutoFillStructure", formSchema);
module.exports = Form;
