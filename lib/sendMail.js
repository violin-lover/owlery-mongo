//define function for sending emails and export it for use in verify
const nodemailer = require('nodemailer');

function sendMail(email) {
  console.log("recipients" + email)

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tsaiada1',
      pass: process.env.user
    }
  });

  const mailOptions = {
    from: 'tsaiada1@gmail.com',
    to: email,
    subject: 'Welcome to Owlery™!',
    html: `
      <center><h1 style="font-family:Simhei">You're so close to getting your owl! </h1><center>
      <center><p style="font-family:Simhei">
        Click on the link below to finish signing up for your owl!
        <br>
        <center>
          <a href = "https://im-not-an-owl.snowkitty.repl.co/signup2.html?e=${email}">Link to Finish Signup!</a>
        <center> 
      </p><center>`
  };

  console.log("recipients " + email)

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

} 


module.exports = sendMail; 