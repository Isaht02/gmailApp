const {validationResult} = require('express-validator')

const Account = require('../models/AccountModel')
const Email = require('../models/EmailModel')
	

module.exports = {
	getAllEmails: async function (req, res, next) {
		try {
		  const { mailbox } = await Account.findOne({ _id: req.user.id })
			.select('mailbox')
			.populate('mailbox.inbox mailbox.outbox mailbox.draft mailbox.trash');
			console.log('Emails found', mailbox)
			res.status(200).json({ message: 'Emails found', mailbox })
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

			const newEmailOut = new Email({
				from: req.body.from,
				to: req.body.to,
				subject: req.body.subject,
				message: req.body.message,
			});
			const savedEmailOut = await newEmailOut.save();
			console.log('Email sent', savedEmailOut);

			const newEmailIn = new Email({
			  from: req.body.to,
			  to: req.body.from,
			  subject: 'Re: ' + req.body.subject,
			  message: req.body.message,
			});
			const savedEmailIn = await newEmailIn.save();
			console.log('Reply received', savedEmailIn);

			res
				.status(201)
				.json({ message: 'Email sent, reply received', sent: savedEmailOut, received: savedEmailIn });

			const foundAccount = await Account.findOne({ _id: req.user.id });
			foundAccount.mailbox.outbox.push(savedEmailOut._id);
			foundAccount.mailbox.inbox.push(savedEmailIn._id);
			await foundAccount.save();

		}catch (error) {
			console.log(error);
			res.status(500);
			}	
	}
}

