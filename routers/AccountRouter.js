const express = require('express')
const Router = express.Router()
const {validationResult} = require('express-validator')
const AccountController = require('../controllers/AccountController')
const upload = require('../middlewares/avatar')

const registerValidator = require('../routers/validators/registerValidator')
const loginValidator = require('../routers/validators/loginValidator')
const passwordValidator = require('../routers/validators/passwordValidator')
const checkLogin = require('../auth/checkLogin')

Router.get('/login', AccountController.getLogin)
Router.post('/login', loginValidator, AccountController.loginValidator)

Router.get('/register', AccountController.getRegister)
Router.post('/register', registerValidator, AccountController.registerValidator)

Router.get('/profile', AccountController.getProfile)
Router.post('/profile', upload.single('avatar'), AccountController.postProfile)


Router.get('/changepassword', AccountController.getChangepassword)
Router.post('/changepassword', checkLogin, passwordValidator, AccountController.postChangepassword)

module.exports = Router