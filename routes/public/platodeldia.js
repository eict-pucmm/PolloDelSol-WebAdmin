const express = require('express');
const axios = require('axios'); 

let app = express();

app.get('/', function (req, res, next) {
    res.render('menu/platodeldia', {data: ''})
});
module.exports = app;

app.get('/edit', function (req, res, next) {
    res.render('menu/editPlato', {data: ''})
});
module.exports = app;
