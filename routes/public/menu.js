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

module.exports = app;