let express = require('express');
let app = express();

app.get('/', function(req, res) {
    res.render('index');
});

module.exports = app;