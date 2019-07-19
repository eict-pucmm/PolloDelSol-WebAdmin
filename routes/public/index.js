const express = require('express');
let app = express();

app.get('/', (req, res) => {
    res.render('index');
});

module.exports = app;