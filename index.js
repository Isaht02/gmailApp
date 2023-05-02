require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cors())

const AccountRouter = require('./routers/AccountRouter')

app.get('/', (req, res) => {
	res.render('index')
})

app.get('/list', (req, res) => {
	res.render('listMail')
})

app.get('/readmail', (req, res) => {
	res.render('readMail')
})

app.get('/sendmail', (req, res) => {
	res.render('sendMail')
})

app.use('/account', AccountRouter)

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
