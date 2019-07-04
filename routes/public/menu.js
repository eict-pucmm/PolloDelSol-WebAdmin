const express = require('express');
const axios   = require('axios');
const url = require('../../config').server.url;

let app = express();

app.get('/', (req, res) => {
    axios.get(`${url}/api/menu`)
        .then(result => {
            res.render('menu/gestionar', {
                menus: result.data.menus
            });
        }).catch(err => console.log(err));
});

app.post('/register', (req, res) => {

    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();

    let errors = req.validationErrors();

    if (!errors) {
        axios.post(`${url}/api/menu/register`, {name: req.body.nombre})
        .then( () => {
            req.flash('success', 'Menu registrado satisfactoriamente');
        }).catch(err => {
            req.flash('error', err);
        }).finally( () => {
            res.redirect('/menu');
        });
    } else {
        req.flash('error', errors[0].msg);
        res.redirect('/menu');
    }
});

module.exports = app;