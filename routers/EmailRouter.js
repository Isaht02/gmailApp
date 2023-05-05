const express = require('express')
const Router = express.Router()
const EmailController = require('../controllers/EmailController')
const CheckLogin = require('../auth/checkLogin')

Router.get('/', CheckLogin, EmailController.getAllEmails)

module.exports = Router