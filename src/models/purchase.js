"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
const { mongoose } = require('../configs/dbConnection')

/* ------------------------------------------------------- */

const PurchaseSchema = new mongoose.Schema(
    {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    firmId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Firm',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },  
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    amount: {
        type: Number
    }
    },
    { collection: "purchases", timestamps: true },
);


module.exports = mongoose.model("Purchase", PurchaseSchema)