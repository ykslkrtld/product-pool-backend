"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
const { mongoose } = require('../configs/dbConnection')

/* ------------------------------------------------------- */

const ProductSchema = new mongoose.Schema(
    {
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },  
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    stock: {
        type: Number,
        required: true
    }
    },
    { collection: "firms", timestamps: true },
);


module.exports = mongoose.model("Product", ProductSchema)