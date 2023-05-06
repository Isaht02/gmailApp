const {check} = require('express-validator')

module.exports = [

    check('to')
    .exists().withMessage('Vui lòng cung cấp địa chỉ email người nhận')    
    .isEmail().withMessage('Địa chỉ email nhận không hợp lệ'),

    check('subject')
    .exists().withMessage('Vui lòng cung tiêu đề mail'),

    check('message')
    .exists().withMessage('Vui lòng cung cấp nội dung gửi mail')
]