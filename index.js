require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session');
const cors = require('cors')
const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(
  session({
    secret: 'conmeomauxanhla', 
    resave: false,
    saveUninitialized: false
  })
);
app.use(cors())

const AccountRouter = require('./routers/AccountRouter')
const EmailRouter = require('./routers/EmailRouter')


app.use('/account', AccountRouter)
app.use('/email', EmailRouter)

app.all('*', (req, res) => res.json({code:101, message: 'Đường dẫn hoặc phương thức không được hỗ trợ'}))

const port = process.env.PORT || 8080

const mongoString = process.env.DATABASE_URL


mongoose.connect(mongoString);
const database = mongoose.connection

database.on('error', (error) => {
    console.log('Không thể kết nối tới db server: '+error)
})
database.once('connected', () => {
    app.listen(port, () => {
        console.log('http://localhost:' + port)
    })
})
