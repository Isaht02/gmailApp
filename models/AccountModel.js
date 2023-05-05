const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AccountSchema = new Schema({
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
    avatar: String,

    mailbox: {
        inbox: [{type: mongoose.Schema.Types.ObjectId, ref: 'Email'}],
        outbox: [{type: mongoose.Schema.Types.ObjectId, ref: 'Email'}],
        draft: [{type: mongoose.Schema.Types.ObjectId, ref: 'Email'}],
        trash: [{type: mongoose.Schema.Types.ObjectId, ref: 'Email'}]
    }

})

module.exports = mongoose.model('Account', AccountSchema)