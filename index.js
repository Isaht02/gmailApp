require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session');
const flash = require('express-flash')
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
app.use(flash())

const AccountRouter = require('./routers/AccountRouter')
const EmailRouter = require('./routers/EmailRouter')


app.use('/account', AccountRouter)
app.use('/email', EmailRouter)
app.get('/test', (req, res) => {
	res.render('reply')
})

app.all('*', (req, res) => res.render('badgate', {code: "404", err: "Duong dan hoac lien ket khong ho tro"}))

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

// mongoose.connect('mongodb://localhost/gmailApp', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useCreateIndex: true
// })
// .then(() => {
//     // chỉ start server sau khi đã connect đến db
//     app.listen(port, () => {
//         console.log('http://localhost:' + port)
//     })
// })
// .catch(e => console.log('Không thể kết nối tới db server: ' + e.message))