const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    let token = req.session.token
    
    if (!token) {
        return res.status(401).json({code: 101, message: 'vui long cung cap token hop le'})
    }
    const {JWT_SECRET} = process.env
    jwt.verify(token, JWT_SECRET, (err, data) => {
        if (err) {
            return res.status(401).json({code: 101, message: 'token khong hop le hoac da het han'})
        }
        req.user = data
        next()
    })
}