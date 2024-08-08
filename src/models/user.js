"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
const { mongoose } = require('../configs/dbConnection')
const passwordEncrypt = require('../helpers/passwordEncrypt')
const emailValidation = require('../helpers/emailValidation')

/* ------------------------------------------------------- */

const UserSchema = new mongoose.Schema(
    {
    username: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        trim: true,
        required: true,
        set: (password) => passwordEncrypt(password),
        // select:false
    },
    email: {
        type: String,
        trim: true,
        required: [true, "An Email address is required"],
        unique: true,
        validate: [
          (email) => emailValidation(email),
          "Email format is not valid",
        ],
    },
    firstName: {
        type: String,
        trim: true,
        required: true
    },
    lastName: {
        type: String,
        trim: true,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isStaff: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    },
    { collection: "users", timestamps: true },
);


module.exports = mongoose.model("User", UserSchema)