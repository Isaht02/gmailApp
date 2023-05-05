const express = require('express')
const Router = express.Router()
const {validationResult} = require('express-validator')
const AccountController = require('../controller/AccountController')

const registerValidator = require('../routers/validators/registerValidator')
const loginValidator = require('../routers/validators/loginValidator')


Router.post('/login', AccountController.loginValidator)

Router.post('/register', AccountController.registerValidator)

module.exports = Router