"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
const { mongoose } = require('../configs/dbConnection')

/* ------------------------------------------------------- */

const FirmSchema = new mongoose.Schema(
    {
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        trim: true,
        required: true
    },
    address: {
        type: String,
        trim: true,
        required: true
    },
    image: {
        type: String,
        trim: true,
        required: true
    }
    },
    { collection: "firms", timestamps: true },
);


module.exports = mongoose.model("Firm", FirmSchema)