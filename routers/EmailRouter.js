const express = require('express')
const Router = express.Router()
const EmailController = require('../controllers/EmailController')
const CheckLogin = require('../auth/checkLogin')
const emailValidator = require('../routers/validators/emailValidator')
const upload = require('../middlewares/attachment')

Router.get('/', CheckLogin, EmailController.getAllEmails)

Router.post('/send',CheckLogin, emailValidator, upload.single('attachment'), EmailController.sendEmail)

Router.post('/draft', CheckLogin, emailValidator, EmailController.saveDraft)
Router.put('/draft/:id', CheckLogin, emailValidator, EmailController.updateDraft)

Router.put('/:id/trash', CheckLogin, EmailController.moveToTrash)
Router.put('/:id/untrash', CheckLogin, EmailController.removeFromTrash)

Router.put('/:id/:toggle', CheckLogin, EmailController.toggleEmailProperty)

Router.delete('/:id', CheckLogin, EmailController.deleteEmail)
module.exports = Router