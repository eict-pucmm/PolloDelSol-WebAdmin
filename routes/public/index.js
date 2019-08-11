const express = require('express');
const axios = require('axios');
const config  = require('../../config')
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

app.post('/puntos', (req, res) => {
    axios.post(`${config.values.server.url}/api/puntos`, {puntos: req.body.puntos})
    .then(result => res.redirect('/'))
    .catch(err => console.log(err));
});

module.exports = app;