const {check} = require('express-validator')

module.exports = [

    check('to')
    .exists().withMessage('Vui lòng cung cấp địa chỉ email người nhận')
    .notEmpty().withMessage('Địa chỉ email nhận không được để trống')
    .isEmail().withMessage('Địa chỉ email nhận không hợp lệ'),

    check('subject')
    .exists().withMessage('Vui lòng cung tiêu đề mail')
    .notEmpty().withMessage('Địa chỉ tiêu đề không được để trống'),

    check('message')
    .exists().withMessage('Vui lòng cung cấp nội dung gửi mail')
    .notEmpty().withMessage('Nội dung gửi mail không được để trống'),
]