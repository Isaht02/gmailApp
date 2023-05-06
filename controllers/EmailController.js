const {validationResult} = require('express-validator')
const multer = require('multer')
const Account = require('../models/AccountModel')
const Email = require('../models/EmailModel')

module.exports = {
	

	getAllEmails: async function (req, res, next) {
		try {
		  	const {mailbox} = await Account.findOne({ _id: req.user.id })
				.select('mailbox')
				.populate('mailbox.inbox mailbox.outbox mailbox.draft mailbox.trash');
			return res.status(200).render('listMail', {emails: mailbox.inbox, name: req.user.name})
		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},

	getSendEmail: function (req, res, next) {
		return res.render('sendMail', {name: req.user.name})
	},

	getDetailEmail: async function (req, res, next) {
		try {
			//console.log(req.params.id)
		  	const email = await Email.findOne({ _id: req.params.id })

			return res.status(200).render('readMail',{email, name: req.user.name}	)
		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},

	sendEmail: async function (req, res, next) {
		try {
			let result = validationResult(req)
			if (result.errors.length !== 0) {
				let messages = result.mapped()
				let message = ''
				for (m in messages) {
					message = messages[m].msg
					break
				}
				return res.json({code: 1, message: message})
			}

			const foundReceiverAccount = await Account.findOne({ email: req.body.to })
			if(!foundReceiverAccount) return res.status(404).json({ error: 'User not found' })

			let attachmentPath = null
			if (req.file) {
		    	attachmentPath = req.file.path;
			}
			const newEmailOut = new Email({
				from: req.user.email,
				to: req.body.to,
				subject: req.body.subject,
				message: req.body.message,
				attachment: attachmentPath,
			})
			const savedEmailOut = await newEmailOut.save()

			res
				.status(201)
				.json({ message: 'Email sent, reply received', sent: savedEmailOut, received: savedEmailOut })

			const foundAccount = await Account.findOne({ _id: req.user.id })

			foundAccount.mailbox.outbox.push(savedEmailOut._id)
			foundReceiverAccount.mailbox.inbox.push(savedEmailOut._id)
			await foundAccount.save()
			await foundReceiverAccount.save()
		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},

	saveDraft: async function (req, res, next) {
		try {
			let newDraft = new Email({
				from: req.body.from,
				to: req.body.to,
				subject: req.body.subject,
				message: req.body.message,
			})

			const savedDraft = await newDraft.save()
			console.log('Draft saved', savedDraft)
			res.status(201).json({ message: 'Draft saved', draft: savedDraft })

			const foundAccount = await Account.findOne({ _id: req.user.id })
			foundAccount.mailbox.draft.push(savedDraft._id)
			await foundAccount.save();

		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},

	updateDraft: async function (req, res, next) {
		try {
			let foundDraft = await Email.findOne({ _id: req.params.id })

			if (!foundDraft)
				return res.status(404).json({ message: 'Email not found', id: req.params.id })

			foundDraft.to = req.body.to
			foundDraft.subject = req.body.subject
			foundDraft.message = req.body.message

			const savedDraft = await foundDraft.save();
			console.log('Draft updated', savedDraft);
			res.status(200).json({ message: 'Draft updated', draft: savedDraft });

		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},

	moveToTrash: async function (req, res, next) {
		try {
			const foundUser = await Account.findOne({ _id: req.user.id })

			let { inbox, outbox, draft, trash } = foundUser.mailbox
			let isEmailFound = false

			if (!isEmailFound)
				for (let i = 0; i < inbox.length; i++) {
					if (inbox[i].equals(req.params.id)) {
						trash.push(inbox[i])
						inbox.splice(i, 1)
						console.log('Moved from inbox to trash', req.params.id)
						isEmailFound = true;
						break;
					}
				}

			if (!isEmailFound)
				for (let i = 0; i < outbox.length; i++) {
					if (outbox[i].equals(req.params.id)) {
						trash.push(outbox[i])
						outbox.splice(i, 1)
						console.log('Moved from outbox to trash', req.params.id)
						isEmailFound = true;
						break;
					}
				}

			if (!isEmailFound)
				for (let i = 0; i < draft.length; i++) {
					if (draft[i].equals(req.params.id)) {
						trash.push(draft[i])
						draft.splice(i, 1)
						console.log('Moved from drafts to trash', req.params.id)
						isEmailFound = true;
						break;
					}
				}

			
			const savedUser = await foundUser.save()
			const { mailbox } = await Account.populate(
				savedUser,
				'mailbox.inbox mailbox.outbox mailbox.draft mailbox.trash',
			)

			res.status(200).json({ message: 'Moved to trash', mailbox })										
		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},

	removeFromTrash: async function (req, res, next) {
		try {
			const foundUser = await Account.findOne({ _id: req.user.id }).populate(
				'mailbox.inbox mailbox.outbox mailbox.draft mailbox.trash',
			)

			
			const { inbox, outbox, draft, trash } = foundUser.mailbox
			for (let i = 0; i < trash.length; i++) {

				if (trash[i]._id.equals(req.params.id)) {
					if (trash[i].to === '' || trash[i].subject === '' || trash[i].message === '') {			 
						draft.push(trash[i]._id)
						trash.splice(i, 1)
						console.log('Moved from trash to drafts', req.params.id)
					} 
					else if (trash[i].from === foundUser.email) {				  
						outbox.push(trash[i]._id)
						trash.splice(i, 1)
						console.log('Moved from trash to outbox', req.params.id)
					} 
					else {				
						inbox.push(trash[i]._id)
						trash.splice(i, 1)
						console.log('Moved from trash to inbox', req.params.id)
					}
					break
				}
			}

			const savedUser = await foundUser.save()
			const { mailbox } = await Account.populate(
			  savedUser,
			  'mailbox.inbox mailbox.outbox mailbox.draft mailbox.trash',
			)

			res.status(200).json({ message: 'Removed from trash', mailbox })																							
		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},

	toggleEmailProperty: async function (req, res, next) {
		try {
			const foundEmail = await Email.findOne({ _id: req.params.id });
			if (!foundEmail)
				return res.status(404).json({ message: 'Email not found', id: req.params.id });

			switch (req.params.toggle) {
				case 'read':
					foundEmail.read = true;
					break;
				case 'unread':
					foundEmail.read = false;
					break;
				case 'favorite':
					foundEmail.favorite = true;
					break;
				case 'unfavorite':
					foundEmail.favorite = false;
					break;
				default:
					return res.status(404).json({ message: "Wrong params, can't parse request" })
			}

			const savedEmail = await foundEmail.save()
			console.log(`${req.params.toggle} status updated`, savedEmail)

			res
				.status(200)
				.json({ message: `${req.params.toggle} status updated`, email: savedEmail })																							
		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},

	deleteEmail: async function (req, res, next) {
		try {
			await Email.deleteOne({ _id: req.params.id });
			console.log('Email deleted', req.params.id);

			const foundAccount = await Account.findOne({ _id: req.user.id });
			let isEmailFound = false;
			let trashbox = foundAccount.mailbox.trash;
			for (let i = 0; i < trashbox.length; i++) {
				if (trashbox[i].equals(req.params.id)) {
					trashbox.splice(i, 1);
					isEmailFound = true;
					break;
				}
			}
			if (!isEmailFound) {
				let drafts = foundAccount.mailbox.draft;
				for (let i = 0; i < drafts.length; i++) {
					if (drafts[i].equals(req.params.id)) {
				  		drafts.splice(i, 1)
				  		break;
					}
			  	}
			}
			await foundAccount.save()	
			res.status(200).json({ message: 'Email deleted', id: req.params.id })																		
		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},

	replyEmail: async function (req, res, next) {
		try {
			let attachmentPath = null
			if (req.file) {
		    	attachmentPath = req.file.path;
			}

			const originalEmail = await Email.findOne({ _id: req.params.id })

			const newEmailOut = new Email({
				from: originalEmail.from,
				to: originalEmail.to,
				subject: originalEmail.subject,
				message: req.body.message,
				attachment: attachmentPath,
				originalMessage: originalEmail.message,
				originalEmail: originalEmail._id,
			})
			const savedEmailOut = await newEmailOut.save()
			console.log('Reply-email sent', savedEmailOut)

			const newEmailIn = new Email({
				from: originalEmail.from,
				to: originalEmail.to,
				message: req.body.message,
				attachment: attachmentPath,
				originalMessage: originalEmail.message,
				originalEmail: originalEmail._id,
			})
			const savedEmailIn = await newEmailIn.save()
			console.log('Reply-email received', savedEmailIn)

			res
				.status(201)
				.json({ message: 'Email reply received', sent: savedEmailOut, received: savedEmailIn })

			const foundAccount = await Account.findOne({ _id: req.user.id })
			foundAccount.mailbox.outbox.push(savedEmailOut._id)
			foundAccount.mailbox.inbox.push(savedEmailIn._id)
			await foundAccount.save()																		
		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},

	transferEmail: async function (req, res, next) {
		try {
			const originalEmail = await Email.findOne({ _id: req.params.id })	
			if (!originalEmail) return res.status(404).json({ error: 'Email not found' })

			const foundAccount = await Account.findOne({ email: req.body.to });
			if (!foundAccount) return res.status(404).json({ error: 'User not found' })

			const transferEmail = new Email({
				from: originalEmail.from,
				to: req.body.to,
				message: originalEmail.message,
				attachment: originalEmail.attachment,
			})
			const saveTransferEmail = await transferEmail.save()

			const foundMyAccount = await Account.findOne({ _id: req.user.id })
			foundMyAccount.mailbox.inbox.push(saveTransferEmail._id)
			foundMyAccount.mailbox.outbox.push(saveTransferEmail._id)
			await foundMyAccount.save()

			return res
				.status(201)
				.json({ message: 'Transfer success', transfer:  transferEmail})

		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},
}

