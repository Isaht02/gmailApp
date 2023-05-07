const express = require('express')
const Router = express.Router()
const {validationResult} = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const multer = require('multer')

const Account = require('../models/AccountModel')
const Email = require('../models/EmailModel')

const {ObjectId} = require('mongodb')



module.exports = {
    getLogin: function(req, res){
        if(req.session.token){
            res.redirect('/email')
        }
        else{
            const error = req.flash('error') || ''
            res.render('login', {error})
        }

    },

    loginValidator: function(req, res) {
        let result = validationResult(req)
        if (result.errors.length === 0) {
            let {email, password} = req.body 
            let account = undefined
    
            Account.findOne({email: email})
            .then(acc => {
                if (!acc) {
                    throw new Error('Email không tồn tại')
                }
                account = acc
                return bcrypt.compare(password, acc.password)
            })
            .then(passwordMatch => {
                if (!passwordMatch) {
                    throw new Error('Mật khẩu không chính xác')
                }
                const {JWT_SECRET} = process.env
                jwt.sign({
                    id: account._id,
                    name: account.fullname,
                    email: account.email
                },JWT_SECRET, {
                    expiresIn: '1h'
                }, (err, token) => {
                    if (err) throw err
                    req.session.token = token
                    return res.redirect('/email')
                })
            })
            .catch(e => {
                req.flash('error', e.message)
                return res.redirect('login')
            })
        }
        else {
            let messages = result.mapped()
            let message = ''
            for (m in messages) {
                message = messages[m].msg
                break
            }
            req.flash('error', message)
            return res.redirect('login')
        }
    },

    getRegister: function(req, res) {
        const error = req.flash('error') || ''
        res.render('register', {error})
    },

    registerValidator: function(req, res) {
        let result = validationResult(req)
        if (result.errors.length === 0) {
    
            let {phonenum, email, password, fullname, avatar} = req.body
            Account.findOne({email: email})
            .then(acc => {
                if (acc) {
                    throw new Error('Email này đã tồn tại')
                }
                return Account.findOne({phonenum: phonenum})
            })
            .then(phonecheck =>{
                if(phonecheck){
                    throw new Error('Số điện thoại này đã tồn tại')
                }
            })

            .then(() => bcrypt.hash(password, 10))
            .then(hashed => {
    
                let user = new Account({
                    phonenum: phonenum,
                    email: email, 
                    password: hashed,
                    fullname: fullname,
                    avatar: 'avatar/default.jpg'
                })
                return user.save();
            })
            .then(() => {
                // không cần trả về chi tiết tài khoản nữa
                return res.redirect('login')
            })
            .catch(e => {
                req.flash('error', e.message)
                return res.redirect('register')
            })
            
        }
        else {
            let messages = result.mapped()
            let message = ''
            for (m in messages) {
                message = messages[m].msg
                break
            }
            req.flash('error', message)
            return res.redirect('register')
        }

    },

    getProfile: async function(req, res){
        try{
            const {JWT_SECRET} = process.env
            var decodedJWT = jwt.verify(req.session.token, JWT_SECRET)
    
            var ObjectId = require('mongodb').ObjectId
            const user = await Account.findOne( {"_id": new ObjectId(decodedJWT)})
    
            const error = req.flash('error') || ''
            const success = req.flash('success') || ''
    
            res.render('profile', {user, error, success})
        }
        catch(e){
            return res.redirect('login')
        }
    },

    postProfile: async function(req, res){
        try{
    
            const {JWT_SECRET} = process.env
            var decodedJWT = jwt.verify(req.session.token, JWT_SECRET)
    
            var ObjectId = require('mongodb').ObjectId
    
            let acc = await Account.findOne({_id: new ObjectId(decodedJWT)})

            let avtPath = null
            if (req.file) {
                avtPath = req.file.path.replace("public", '')
            }

            //update db
            acc.email = req.body.email
            acc.fullname = req.body.fullname
            if(avtPath !== null){
                acc.avatar = avtPath
            }

            const saveacc = await acc.save();
            console.log('update thanh cong')
            console.log(avtPath)

            req.flash('success', 'Cập nhật thành công')
            return res.redirect('profile')

        }
        catch(e){
            req.flash('error', e.message)
            return res.redirect('profile')
        }
    },

    getChangepassword: function(req, res){
        if(!req.session.token){
            return res.redirect('login')
        }
        else{
            const error = req.flash('error') || ''
            res.render('changepassword', {error})
        }
    },

    postChangepassword: async function(req, res){
        let {password, newpassword, confirmpassword} = req.body

        let acc = await Account.findOne({_id: req.user.id})

        let result = validationResult(req)

        if((result.errors.length === 0)){

            hashed = await bcrypt.hash(newpassword, 10)

            acc.password = hashed
            const saveacc = await acc.save()
            console.log('doi mat khau thanh cong')
            return res.redirect('login')
        }

        else {
            let messages = result.mapped()
            let message = ''
            for (m in messages) {
                message = messages[m].msg
                break
            }
            req.flash('error', message)
            return res.redirect('changepassword')
        }
    },

    getAdmin: async function(req, res){
        const error = req.flash('error') || ''
        const membercount = await Account.count({})

        const listmember = await Account.find()
        
        const mailcount = await Email.count({})
        res.render('admin', {error, membercount, mailcount, listmember})
    }
}

