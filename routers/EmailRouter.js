const express = require('express')
const Router = express.Router()
const EmailController = require('../controllers/EmailController')
const CheckLogin = require('../auth/checkLogin')
const emailValidator = require('../routers/validators/emailValidator')
const upload = require('../middlewares/attachment')

Router.get('/', CheckLogin, EmailController.getAllEmails)
Router.get('/search', CheckLogin, EmailController.searchEmails)
Router.get('/sentemail', CheckLogin, EmailController.getSentEmails)
Router.get('/importantemail', CheckLogin, EmailController.getImportantEmails)
Router.get('/draftemail', CheckLogin, EmailController.getDraftEmails)
Router.get('/trashemail', CheckLogin, EmailController.getTrashEmails)

Router.get('/send', CheckLogin, EmailController.getSendEmail)
Router.post('/send', CheckLogin, upload.single('attachment'), EmailController.sendEmail)
Router.post('/send/:id', CheckLogin, EmailController.replyEmail)

Router.get('/:id', CheckLogin, EmailController.getDetailEmail)

Router.post('/draft', CheckLogin, emailValidator, EmailController.saveDraft)
Router.put('/draft/:id', CheckLogin, emailValidator, EmailController.updateDraft)

Router.post('/:id/trash', CheckLogin, EmailController.moveToTrash)
Router.put('/:id/untrash', CheckLogin, EmailController.removeFromTrash)

Router.post('/toggle', CheckLogin, EmailController.toggleEmailProperty)

Router.delete('/delete/:id', CheckLogin, EmailController.deleteEmail)

Router.post('/forward/:id', CheckLogin, EmailController.forwardEmail)
module.exports = Router