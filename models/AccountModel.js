const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AccountSchema = new Schema({
    phonenum: {
        type:String,
        required: true,
        unique: true
    },
    email: {
        type:String,
        required: true,
        unique: true
    },
    password: { 
        type: String,
        required: true
    },
    fullname: {
        type: String,
        require: true
    },
    avatar: {
        type: String,
		default: null,
    },

    mailbox: {
        inbox: [{type: mongoose.Schema.Types.ObjectId, ref: 'Email'}],
        outbox: [{type: mongoose.Schema.Types.ObjectId, ref: 'Email'}],
        draft: [{type: mongoose.Schema.Types.ObjectId, ref: 'Email'}],
        trash: [{type: mongoose.Schema.Types.ObjectId, ref: 'Email'}]
    }

})

module.exports = mongoose.model('Account', AccountSchema)