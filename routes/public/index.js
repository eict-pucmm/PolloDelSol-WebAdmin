const express = require('express');
const axios = require('axios');
const config  = require('../../config');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const handlebars = require('handlebars');
const fs = require('fs');

const readHTMLFile = (path, callback) => {
  fs.readFile(path, {encoding: 'utf-8'}, (err, html) => {
      if (err) {
          callback(err, null);
      }
      else {
          callback(null, html);
      }
  });
};

const transporter = nodemailer.createTransport({
    service: config.nodemailer.service,
    auth: {
        user: config.nodemailer.user,
        pass: config.nodemailer.password
    }
});

let app = express();

app.get('/', (req, res) => {
  
  if (req.session.loggedIn) {
      axios.get(`${config.server.url}/api/puntos`)
      .then(result => {
          res.render('index', {
              valor_puntos: result.data.valor_puntos,
          });
      })
      .catch(err => console.log(err));
  } else {
      res.redirect('/login');
  }
});

app.post('/sendEmailVerification/(:email)', (req, res) => {

    const token = jwt.sign({
            email: req.params.email
        },
        config.server.secret, 
        {
            expiresIn: config.nodemailer.duration
        }
    );
    
    readHTMLFile(__dirname + '\\..\\..\\views\\public\\templates\\email_verification.html', (err, html) => {
      if (!err) {
        let template = handlebars.compile(html);
        let replacements = {
            url: config.server.url,
            token: token
        };
        let htmlToSend = template(replacements);
  
        const options = {
          to: req.params.email,
          from: config.nodemailer.user,
          subject: 'Verificación de correo - Pollo del Sol',
          html: htmlToSend
        }
  
        transporter.sendMail(options, (error, info) => {
          if (!error) {
            res.redirect('/empleado')
          }
        });
      }
    });

});

app.get('/verifyEmail/(:token)', (req, res) => {

    const decoded = jwt.verify(req.params.token, config.server.secret);

    axios.post(`${config.server.url}/api/verifyEmail`, {correo: decoded.email})
    .then( () => {
        res.render('email_verification');
    })
    .catch(err => console.log(err));
});

app.post('/puntos', (req, res) => {
    axios.post(`${config.server.url}/api/puntos`, {puntos: req.body.puntos})
    .then(result => res.redirect('/'))
    .catch(err => console.log(err));
});

module.exports = app;