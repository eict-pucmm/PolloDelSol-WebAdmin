const express = require('express');
const axios = require('axios'); 
const url = require('../../config').server.url;

let app = express();

app.get('/', (req, res, next) => {
    axios.get(`${url}/api/platodeldia`)
        .then(result => {
            return result.data;
        }).then(datos => {
                console.log(datos);
                res.render('menu/platodeldia', {data: ""})
        }).catch(err => res.send(err))
    
});

app.get('/edit/(:id_menu)', function (req, res, next) {
    axios.get(`${url}/api/platodeldia/edit/${req.params.id_menu}`)
        .then(result => {
            return result.data;
        }).then(datos => {
                console.log(datos);
                res.render('menu/editPlato', {data: datos})
        }).catch(err => res.send(err))
});
module.exports = app;
