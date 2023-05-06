const express = require('express')
const Router = express.Router()
const {validationResult} = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Account = require('../models/AccountModel')



module.exports = {
    getLogin: function(req, res){
        const error = req.flash('error') || ''
        res.render('login', {error})
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
    
            let {phonenum, email, password, fullname} = req.body
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
                    fullname: fullname
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

    }
}