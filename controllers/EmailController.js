const {validationResult} = require('express-validator')

const Account = require('../models/AccountModel')
const Email = require('../models/EmailModel')



module.exports = {
	getAllEmails: async function (req, res, next) {
	try {
	  const { mailbox } = await Account.findOne({ _id: req.user.id })
		.select('mailbox')
		.populate('mailbox.inbox mailbox.outbox mailbox.drafts mailbox.trash');
	  	console.log('Emails found', mailbox);
		res.status(200).json({ message: 'Emails found', mailbox });
	}catch (error) {
		console.log(error);
		res.status(500);
	}
	}
}

