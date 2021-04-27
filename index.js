const path = require('path')
const crypto = require('crypto')

require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// this is where the fs moved to for getting/saving users
const userService = require('./utils/jsonUserService')

const itemsService = require('./utils/jsonItemService')

// this is where our email sending moved to 
const emailService = require('./utils/emailService')


const app = express()

app.use(bodyParser.json())

app.use((req, res, next) => {
  // this is an express middleware that is logging to the console
  console.log(req.method, req.url)
  next()
})




app.post('/register', async (req, res) => {
  const user = {}
  user.email = req.body.email
  const hashedPw = bcrypt.hashSync(req.body.password, 12)
  console.log(hashedPw)
  user.password = hashedPw
  user.verified = null
  user.confirmCode = crypto.randomBytes(16).toString('hex')


  // The code was moved to a function since it 
  // will be reused, but it is basically the same.
  const users = await userService.getUsers()


  // This section is added to ensure there are no
  // duplicate email addresses.
  const exists = users.find(u => u.email === user.email)

  if (exists) {
    return res.status(403).json({ message: 'Email already in use.' })
  }

  users.push(user)
  await userService.saveUsers(users)

  console.log('before send email')

  const sendResponse = await emailService.sendConfirmEmail(user)
  if (sendResponse === 'success') {
    res.status(201).json({ message: 'success' })
  } else {
    res.status(500).json({ message: 'sending email failed' })
  }


})

app.get('/confirm-email', async (req, res) => {

  if (req.query.email && req.query.confirmCode) {
    const users = await userService.getUsers()

    const indexOfUser = users.findIndex(u => u.email == req.query.email && u.confirmCode == req.query.confirmCode)

    if (indexOfUser != -1) {
      const user = users.splice(indexOfUser, 1)[0]

      user.verified = new Date().toISOString()
      delete user.confirmCode
      users.push(user)

      await userService.saveUsers(users)
      console.log('user confirmed!')
      return res.redirect('/')     // eventually this will send to /login
    }
  }
  res.status(400).json({ message: 'User email and confirmation code do not match.' })
})

app.post('/login', async (req, res) => {
  const email = req.body.email
  const pw = req.body.password

  const users = await userService.getUsers()
  const user = users.find(u => u.email == email)

    if (user) {

      if (!user.verified) {
        return res.status(400).json({ message: 'need to confirm account' })
      } 

      const loggedIn = bcrypt.compareSync(pw, user.password)
      console.log(loggedIn)

      if (loggedIn) {
        delete user.password
        const token = jwt.sign(user, 'secret')
        console.log(token)
        res.setHeader('Set-Cookie', `token=${token}`)
        return res.json({ message: 'logged in', token })
      }
    }

  res.status(401).json({ message: 'not logged in' })


})

app.get('/register', function (req, res) {
  res.sendFile(path.join(__dirname, 'register.html'))
})

app.get('/login', function (req, res) {
  res.sendFile(path.join(__dirname, 'login.html'))
})

const checkAuth = (req, res, next) => {

  if (req.headers.cookie) {

    const tokenCookie = req.headers.cookie.split('; ')
    const tokenSplit = tokenCookie.find(c => c.startsWith('token='))
                    .split('=')
    if (tokenSplit.length == 2) {
      const token = tokenSplit[1]

      try {
        const user = jwt.verify(token, 'secret')
        req.user = user
        return next()
      } catch (ex) {
        console.log(ex)
      }
    }    
  }

  res.redirect('/login')

}

app.get('/secret', checkAuth, function (req, res) {
  console.log(req.user)
  res.json({ message: 'secret information' })
})

app.get('/myitems', checkAuth, async (req, res) => {

  const items = await itemsService.getItems(req.user.email)
  res.json(items)
})

app.post('/myitems/:id', checkAuth, async (req, res) => {
  console.log(req.body)
  res.json({ message: 'received' })
})

app.get('/', checkAuth, function (req, res) {
  console.log(req.user)
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(80, () => {
  console.log('server started')
})