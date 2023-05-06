const express = require('express')
const Router = express.Router()
const EmailController = require('../controllers/EmailController')
const CheckLogin = require('../auth/checkLogin')
const emailValidator = require('../routers/validators/emailValidator')
const upload = require('../middlewares/attachment')

Router.get('/', CheckLogin, EmailController.getAllEmails)


Router.get('/send', CheckLogin, EmailController.getSendEmail)
Router.post('/send', CheckLogin, upload.single('attachment'), EmailController.sendEmail)
Router.post('/send/:id', CheckLogin, EmailController.replyEmail)

Router.get('/:id', CheckLogin, EmailController.getDetailEmail)

Router.post('/draft', CheckLogin, emailValidator, EmailController.saveDraft)
Router.put('/draft/:id', CheckLogin, emailValidator, EmailController.updateDraft)

Router.put('/:id/trash', CheckLogin, EmailController.moveToTrash)
Router.put('/:id/untrash', CheckLogin, EmailController.removeFromTrash)

Router.put('/:id/:toggle', CheckLogin, EmailController.toggleEmailProperty)

Router.delete('/delete/:id', CheckLogin, EmailController.deleteEmail)

Router.post('/transfer/:id', CheckLogin, EmailController.transferEmail)
module.exports = Router