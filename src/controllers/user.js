"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */

const User = require('../models/user')

/* ------------------------------------------------------- */

const passwordEncrypt = require('../helpers/passwordEncrypt')

// data = req.body
const checkUserEmailAndPassword = function (data) {
    
    // Email Control:
    const isEmailValidated = data.email ? /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email) : true

    if (isEmailValidated) {

        const isPasswordValidated = data.password ? /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(data.password) : true

        if (isPasswordValidated) {

            data.password = passwordEncrypt(data.password)

            return data

        } else {
            throw new Error('Password is not validated.')
        }
    } else {
        throw new Error('Email is not validated.')
    }

}

/* ------------------------------------------------------- */

module.exports = {

    list: async (req, res) => {
        /*
            #swagger.tags = ["Users"]
            #swagger.summary = "List Users"
            #swagger.description = `
                You can send query with endpoint for search[], sort[], page and limit.
                <ul> Examples:
                    <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                    <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
                    <li>URL/?<b>page=2&limit=1</b></li>
                </ul>
            `
        */
        const data = await res.getModelList(User)

        res.status(200).send({
            error: false,
            details: await res.getModelListDetails(User),
            data,
          });
    },
    create: async (req, res) => {
        /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Create User"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "username": "test",
                    "password": "1234",
                    "email": "test@site.com",
                    "firstName": "test",
                    "lastName": "test"
                }
            }
        */
        const data = await User.create(checkUserEmailAndPassword(req.body))

        res.status(201).send({
            error: false,
            data,
          });
    },
    read: async (req, res) => {
        /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Get Single User"
        */
        const data = await User.findOne({ _id: req.params.id });

        res.status(200).send({
            error: false,
            data,
          });
    },
    update: async (req, res) => {
        /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Update User"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "username": "test",
                    "password": "1234",
                    "email": "test@site.com",
                    "firstName": "test",
                    "lastName": "test"
                }
            }
        */
        // const data = await User.updateOne({ _id: req.params.id }, req.body, { runValidators: true })
        const data = await User.updateOne({ _id: req.params.id }, checkUserEmailAndPassword(req.body), { runValidators: true })

        res.status(202).send({
            error: false,
            data,
            new: await User.findOne({ _id: req.params.id }),
          });
    },
    delete: async (req, res) => {
        /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Delete User"
        */
        const data = await User.deleteOne({ _id: req.params.id });

        res.status(data.deletedCount ? 204 : 404).send({
          error: !data.deletedCount,
          data,
    });
    }
}