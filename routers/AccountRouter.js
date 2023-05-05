const express = require('express')
const Router = express.Router()
const {validationResult} = require('express-validator')
const AccountController = require('../controllers/AccountController')

const registerValidator = require('../routers/validators/registerValidator')
const loginValidator = require('../routers/validators/loginValidator')


Router.post('/login', loginValidator, AccountController.loginValidator)

Router.post('/register', loginValidator, AccountController.registerValidator)

module.exports = Router