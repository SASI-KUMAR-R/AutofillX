const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require("dotenv").config();
const formRoutes = require("../backend/routes/formRoutes");
const userRoutes = require("../backend/routes/userRoutes");
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

app.use("/api/forms",formRoutes);
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 5000 ;
app.listen(PORT,()=>console.log("Server is running on port 5000"));