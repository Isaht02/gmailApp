const {check} = require('express-validator')

module.exports = [
    check('newpassword')
    .exists().withMessage('Vui lòng cung cấp mật khẩu mới')
    .notEmpty().withMessage('Mật khẩu mới không được để trống')
    .isLength({min: 6}).withMessage('Mật khẩu mới phải có tối thiểu 6 ký tự'),

    check('confirmpassword')
    .custom((value, {req}) => value === req.body.newpassword).withMessage('Xác nhận mật khẩu không giống nhau'),
]