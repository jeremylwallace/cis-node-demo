const nodemailer = require('nodemailer')


const sendConfirmEmail = async (user) => {

    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PW
      }
  });
  
    console.log('sending email')
  
    const link = `http://localhost:3000/confirm-email?email=${user.email}&confirmCode=${user.confirmCode}`
  
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Confirm Email Address',
      html: `Click here to confirm your email: <a href="${link}" target="_blank">${link}</a>`
    })
  
    console.log('email sent')
    return 'success'
  
  }

  module.exports = {
      sendConfirmEmail
}