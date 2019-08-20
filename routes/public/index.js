const express = require('express');
const axios = require('axios');
const config  = require('../../config');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
    service: config.values.nodemailer.service,
    auth: {
        user: config.values.nodemailer.user,
        pass: config.values.nodemailer.password
    }
});

let app = express();

app.get('/', (req, res) => {
    if (config.loggedIn) {
        axios.get(`${config.values.server.url}/api/puntos`)
        .then(result => {
            res.render('index', {
                valor_puntos: result.data.valor_puntos,
            });
        })
        .catch(err => console.log(err));
    } else {
        res.redirect('/login')
    }
});

app.post('/sendEmailVerification/(:email)', (req, res) => {

    const token = jwt.sign({
            email: req.params.email
        },
        config.values.server.secret, 
        {
            expiresIn: config.values.nodemailer.duration
        }
    );
    
    const options = {
        to: req.params.email,
        from: config.values.nodemailer.user,
        subject: 'Verificar correo',
        html: `<!DOCTYPE html>
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <title>Pollo del Sol - Verificación de correo electrónico</title>
          <style type="text/css" rel="stylesheet" media="all">
            *:not(br):not(tr):not(html) {
              font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
              -webkit-box-sizing: border-box;
              box-sizing: border-box;
            }
            body {
              width: 100% !important;
              height: 100%;
              margin: 0;
              line-height: 1.4;
              background-color: #F5F7F9;
              color: #839197;
              -webkit-text-size-adjust: none;
            }
            a {
              color: #414EF9;
            }
            .email-wrapper {
              width: 100%;
              margin: 0;
              padding: 0;
              background-color: #F5F7F9;
            }
            .email-content {
              width: 100%;
              margin: 0;
              padding: 0;
            }
            .email-body {
              width: 100%;
              margin: 0;
              padding: 0;
              border-top: 1px solid #E7EAEC;
              border-bottom: 1px solid #E7EAEC;
              background-color: #FFFFFF;
            }
            .email-body_inner {
              width: 570px;
              margin: 0 auto;
              padding: 0;
            }
            .body-action {
              width: 100%;
              margin: 30px auto;
              padding: 0;
              text-align: center;
            }
            .content-cell {
              padding: 35px;
            }
            h1 {
              margin-top: 0;
              color: #292E31;
              font-size: 19px;
              font-weight: bold;
              text-align: left;
            }
            p {
              margin-top: 0;
              color: #839197;
              font-size: 16px;
              line-height: 1.5em;
              text-align: left;
            }
            p.center {
              text-align: center;
            }
            .button {
              display: inline-block;
              width: 200px;
              background-color: #e32726;
              border-radius: 3px;
              color: #ffffff;
              font-size: 15px;
              line-height: 45px;
              text-align: center;
              text-decoration: none;
              -webkit-text-size-adjust: none;
              mso-hide: all;
            }
            @media only screen and (max-width: 500px) {
              .button {
                width: 100% !important;
              }
            }
          </style>
        </head>
        <body>
          <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <table class="email-content" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="email-body" width="100%">
                      <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0">
                        <tr>
                          <td class="content-cell">
                            <h1>Verificación de correo electrónico</h1>
                            <p>Presione el botón para verificar su correo electrónico</p>
                            <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td align="center">
                                    <a href="${config.values.server.url}/verifyEmail/${token}" class="button">Verificar correo</a>
                                </td>
                              </tr>
                            </table>
                            <p>Si tiene problemas para presionar el boton, haga click en el siguiente enlace: </p>
                            <p><a href="${config.values.server.url}/verifyEmail/${token}">${config.values.server.url}/verifyEmail/${token}</a></p>
                            <p>Este enlace vencerá en una hora.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>`
    }

    transporter.sendMail(options, (error, info) => {
      res.redirect('/empleado')
    });
});

app.get('/verifyEmail/(:token)', (req, res) => {

    const decoded = jwt.verify(req.params.token, config.values.server.secret);

    axios.post(`${config.values.server.url}/api/verifyEmail`, {correo: decoded.email})
    .then( () => {
        res.render('email_verification');
    })
    .catch(err => console.log(err));
});

app.post('/puntos', (req, res) => {
    axios.post(`${config.values.server.url}/api/puntos`, {puntos: req.body.puntos})
    .then(result => res.redirect('/'))
    .catch(err => console.log(err));
});

module.exports = app;