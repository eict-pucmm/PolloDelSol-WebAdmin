const express = require('express');
const axios = require('axios');
const config  = require('../../config');
const nodemailer = require('nodemailer');

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

app.post('/sendEmailVerification', (req, res) => {

    let mailOptions = {
        from: config.values.nodemailer.user,
        to: req.body.correo,
        subject: 'Verificación de correo - Pollo del Sol',
        html: `<html><body><p>Haga click en el botón para verificar su correo electrónico</p>
               <a href="10.0.0.6:5000/verifyEmail/${req.body.correo}">10.0.0.6:5000/verifyEmail/${req.body.correo}</a></body></html>`
    };
      
    transporter.sendMail(mailOptions, (error, info) => {
        if (!error) {
            res.status(200).send({error: false, message: 'Email enviado satisfactoriamente'});
        } else {
            res.status(500).send({error: error, message: 'Error al enviar correo de verificación'});
        }
    });
});

app.post('/verifyEmail/(:correo)', (req, res) => {
    axios.post(`${config.values.server.url}/api/verifyEmail`, {correo: req.params.correo})
    .then(result => console.log(result))
    .catch(err => console.log(err));
});

app.post('/puntos', (req, res) => {
    axios.post(`${config.values.server.url}/api/puntos`, {puntos: req.body.puntos})
    .then(result => res.redirect('/'))
    .catch(err => console.log(err));
});

module.exports = app;