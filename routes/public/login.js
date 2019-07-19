const express = require('express');
let app = express();

app.get('/', function (req, res, next) {
        res.render('login/login')
});
module.exports = app;