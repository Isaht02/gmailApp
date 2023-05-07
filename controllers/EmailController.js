const {validationResult} = require('express-validator')
const multer = require('multer')
const Account = require('../models/AccountModel')
const Email = require('../models/EmailModel')
const mongoose = require('mongoose')

module.exports = {
	
	searchEmails: async function(req, res, next) {
		try{
			const account = await Account.findOne({ _id: req.user.id })
			const keyword = req.query.q;
			const emails = await Email.find({ $or: [{ subject: { $regex: keyword, $options: 'i' } }, { body: { $regex: keyword, $options: 'i' } }] });
			const lstEmails = []
			emails.forEach(function(email, i) {
 				lstEmails.push(email.from)
			})
			const senders = await Account.find({ email: { $in: lstEmails }});
			return res.render('listMail', {senders, emails: emails, keyword, name: req.user.name, avt: account.avatar});

		}	
		catch (error) {
			console.log(error)
			res.status(500)
		}
	},

	getAllEmails: async function (req, res, next) {
		try {
			const account = await Account.findOne({ _id: req.user.id })
		  	const {mailbox} = await Account.findOne({ _id: req.user.id })
				.select('mailbox')
				.populate('mailbox.inbox mailbox.outbox mailbox.draft mailbox.trash');

			const lstEmails = []
			mailbox.inbox.forEach(function(email, i) {
 				lstEmails.push(email.from)
			})
			const senders = await Account.find({ email: { $in: lstEmails }});
			return res.status(200).render('listMail', {senders, emails: mailbox.inbox, name: req.user.name, avt: account.avatar})
		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},

	getSentEmails: async function (req, res, next) {
		try {
			const account = await Account.findOne({ _id: req.user.id })
		  	const {mailbox} = await Account.findOne({ _id: req.user.id })
				.select('mailbox')
				.populate('mailbox.inbox mailbox.outbox mailbox.draft mailbox.trash');
			const lstEmails = []
			mailbox.outbox.forEach(function(email, i) {
 				lstEmails.push(email.from)
			})
			const senders = await Account.find({ email: { $in: lstEmails }});
			return res.status(200).render('sentMail', {senders, emails: mailbox.outbox, name: req.user.name, avt: account.avatar})
		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},

	getImportantEmails: async function (req, res, next) {
		try {
			const account = await Account.findOne({ _id: req.user.id })
		  	const {mailbox} = await Account.findOne({ _id: req.user.id })
				.select('mailbox')
				.populate('mailbox.inbox mailbox.outbox mailbox.draft mailbox.trash');
			const emailFavorite = []
			for(let i = 0; i<mailbox.inbox.length; i++)
				if (mailbox.inbox[i].favorite)
				{
					emailFavorite.push(mailbox.inbox[i])
				}
			const lstEmails = []
			emailFavorite.forEach(function(email, i) {
 				lstEmails.push(email.from)
			})
			const senders = await Account.find({ email: { $in: lstEmails }});
			return res.status(200).render('favMail', {senders, emails: emailFavorite, name: req.user.name, avt: account.avatar})
		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},

	getDraftEmails: async function (req, res, next) {
		try {
			const account = await Account.findOne({ _id: req.user.id })
		  	const {mailbox} = await Account.findOne({ _id: req.user.id })
				.select('mailbox')
				.populate('mailbox.inbox mailbox.outbox mailbox.draft mailbox.trash');
			const lstEmails = []
			mailbox.draft.forEach(function(email, i) {
 				lstEmails.push(email.from)
			})
			const senders = await Account.find({ email: { $in: lstEmails }});
			return res.status(200).render('draftMail', {senders, emails: mailbox.draft, name: req.user.name, avt: account.avatar})
		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},

	getTrashEmails: async function (req, res, next) {
		try {
			const account = await Account.findOne({ _id: req.user.id })
		  	const {mailbox} = await Account.findOne({ _id: req.user.id })
				.select('mailbox')
				.populate('mailbox.inbox mailbox.outbox mailbox.draft mailbox.trash');
			const lstEmails = []
			mailbox.trash.forEach(function(email, i) {
 				lstEmails.push(email.from)
			})
			const senders = await Account.find({ email: { $in: lstEmails }});
			return res.status(200).render('trashMail', {senders, emails: mailbox.trash, name: req.user.name, avt: account.avatar})
		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},

	getSendEmail: async function (req, res, next) {
		try {
			const account = await Account.findOne({ _id: req.user.id })
			return res.render('sendMail', {name: req.user.name, avt: account.avatar})
		}catch (error) {
			console.log(error)
			res.status(500)
		}	
		
	},

	getDetailEmail: async function (req, res, next) {
		try {
			const account = await Account.findOne({ _id: req.user.id })
		  	const email = await Email.findOne({ _id: req.params.id })
		  	const error = req.flash('error') || ''
		  	email.read = true
		  	await email.save()
		  	const senders = await Account.findOne({ email: email.from })
		  	console.log(senders)
			return res.status(200).render('readMail',{senders, email, name: req.user.name, error, avt: account.avatar}	)
		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},

	sendEmail: async function (req, res, next) {
		try {
			if (req.body.subForm == 'Draft') {
				try {
					let newDraft = new Email({
						idSender: req.user.id,
						from: req.user.email,
						to: req.body.to,
						subject: req.body.subject,
						message: req.body.message,
					})

					const savedDraft = await newDraft.save()
					console.log('Draft saved', savedDraft)

					const foundAccount = await Account.findOne({ _id: req.user.id })
					foundAccount.mailbox.draft.push(savedDraft._id)
					await foundAccount.save();
					return res.redirect('/email')

				}catch (error) {
					console.log(error)
					res.status(500)
				}
			} 
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
				idSender: req.user.id,
				from: req.user.email,
				to: req.body.to,
				subject: req.body.subject,
				message: req.body.message,
				attachment: attachmentPath,
			})
			const savedEmailOut = await newEmailOut.save()

			const foundAccount = await Account.findOne({ _id: req.user.id })

			foundAccount.mailbox.outbox.push(savedEmailOut._id)
			foundReceiverAccount.mailbox.inbox.push(savedEmailOut._id)
			await foundAccount.save()
			await foundReceiverAccount.save()

			return res.redirect('/email')

		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},

	saveDraft: async function (req, res, next) {
		try {
			let newDraft = new Email({
				idSender: req.user.id,
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

			return res.status(200).redirect('/email')									
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
			const foundEmail = await Email.findOne({ _id: req.body.idEmail });
			if (!foundEmail)
				return res.redirect('/email')
			if (req.body.options == 'trash') 
			{
				try {
					const foundUser = await Account.findOne({ _id: req.user.id })

					let { inbox, outbox, draft, trash } = foundUser.mailbox
					let isEmailFound = false

					if (!isEmailFound)
						for (let i = 0; i < inbox.length; i++) {
							if (inbox[i].equals(req.body.idEmail)) {
								trash.push(inbox[i])
								inbox.splice(i, 1)
								isEmailFound = true;
								break;
							}
						}

					if (!isEmailFound)
						for (let i = 0; i < outbox.length; i++) {
							if (outbox[i].equals(req.body.idEmail)) {
								trash.push(outbox[i])
								outbox.splice(i, 1)
								isEmailFound = true;
								break;
							}
						}

					if (!isEmailFound)
						for (let i = 0; i < draft.length; i++) {
							if (draft[i].equals(req.body.idEmail)) {
								trash.push(draft[i])
								draft.splice(i, 1)
								isEmailFound = true;
								break;
							}
						}

					
					const savedUser = await foundUser.save()
					const { mailbox } = await Account.populate(
						savedUser,
						'mailbox.inbox mailbox.outbox mailbox.draft mailbox.trash',
					)

					return res.redirect('/email')										
				}catch (error) {
					console.log(error)
					res.status(500)
				}	
			}
			switch (req.body.options) {
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
			}

			const savedEmail = await foundEmail.save()
			console.log(`${req.body.options} status updated`, savedEmail)

			return res.redirect('/email')																							
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
			if (req.body.message.length === 0) {
				req.flash('error', 'Vui lòng soạn nội dung tin nhắn')
				return res.redirect(`/email/${req.params.id}`)
			}
			const originalEmail = await Email.findOne({ _id: req.params.id })

			const replyEmailSent = new Email({
				idSender: req.user.id,
				from: req.user.email,
				to: originalEmail.from,
				subject: originalEmail.subject,
				message: req.body.message,
				attachment: attachmentPath,
				originalMessage: originalEmail.message,
				originalEmail: originalEmail._id,
			})
			const savedEmail = await replyEmailSent.save()
			console.log('Reply-email sent', savedEmail)

			// res
			// 	.status(201)
			// 	.json({ message: 'Email reply received', sent: savedEmail})

			const senderAccount = await Account.findOne({ _id: req.user.id })
			const receiverAccount = await Account.findOne({ email: originalEmail.from })
			senderAccount.mailbox.outbox.push(savedEmail._id)
			receiverAccount.mailbox.inbox.push(savedEmail._id)
			await senderAccount.save()
			await receiverAccount.save()	
			return res.redirect('/email')														
		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},

	forwardEmail: async function (req, res, next) {
		try {
			const originalEmail = await Email.findOne({ _id: req.params.id })
			if (!originalEmail) return res.status(404).json({ error: 'Email not found' })

			const foundAccount = await Account.findOne({ email: req.body.email });
			if (!foundAccount) return res.status(404).json({ error: 'User not found' })

			const transferEmail = new Email({
				idSender: req.user.id,
				from: originalEmail.from,
				to: req.body.email,
				subject: originalEmail.subject,
				message: originalEmail.message,
				attachment: originalEmail.attachment,
			})
			const saveforwardEmail = await transferEmail.save()

			const foundMyAccount = await Account.findOne({ _id: req.user.id })
			foundAccount.mailbox.inbox.push(saveforwardEmail._id)
			foundMyAccount.mailbox.outbox.push(saveforwardEmail._id)
			await foundMyAccount.save()
			await foundAccount.save()
			return res
				.status(201).redirect('/email')

		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},

	addlLabelEmail: async function (req, res, next) {
		try {
			if (!req.body.options) return res.redirect('/email')
			const foundEmail = await Email.findOne({ _id: req.body.idEmail });
			if (!foundEmail)
				return res.redirect('/email')
			foundEmail.labels = req.body.options
			await foundEmail.save()
			console.log('Label: ' + foundEmail.labels)
			return res.redirect('/email')

		}catch (error) {
			console.log(error)
			res.status(500)
		}	
	},
}

