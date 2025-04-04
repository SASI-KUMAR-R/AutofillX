const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    details: {
        type: Map,
        of: String,     
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model("AutoFillUser", UserSchema);
