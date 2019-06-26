let express = require('express');
const axios = require('axios');
let app = express();

app.get('/', function(req, res) {
    res.render('index');
});

module.exports = app;