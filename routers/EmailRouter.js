const express = require('express')
const Router = express.Router()
const EmailController = require('../controllers/EmailController')
const CheckLogin = require('../auth/checkLogin')
const emailValidator = require('../routers/validators/emailValidator')

Router.get('/', CheckLogin, EmailController.getAllEmails)
Router.post('/send', CheckLogin, emailValidator, EmailController.sendEmail)

module.exports = Router