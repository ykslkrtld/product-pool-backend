"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
const router = require('express').Router()
/* ------------------------------------------------------- */

const user = require('../controllers/user')

const { isAdmin, isLogin } = require('../middlewares/permissions')

// URL: /users

router.route('/')
    .get(isAdmin, user.list)
    .post(user.create)

router.route('/:id')
    .get(isLogin, user.read)
    .put(isLogin, user.update)
    .patch(isLogin, user.update)
    .delete(isAdmin, user.delete);

/* ------------------------------------------------------- */
module.exports = router;
