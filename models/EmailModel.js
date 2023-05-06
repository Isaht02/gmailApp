const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EmailSchema = new Schema({
	from: {
		type: String,
		required: true,
	},
	to: String,
	subject: String,
	message: String,
	read: {
		type: Boolean,
		default: false,
	},
	favorite: {
		type: Boolean,
		default: false,
	},
	labels: {
    	type: [String],
    	default: [],
  	},
	attachment: {
		type: String,
		default: null,
	},
	originalMessage: {
		type: String,
		default: '',
	},
	originalEmail: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Email',
		default: null,
	},
	},

	{
		timestamps: true,
	},
)

module.exports = mongoose.model('Email', EmailSchema)