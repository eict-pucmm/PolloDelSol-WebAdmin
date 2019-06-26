const express = require('express');
const empresaAPI = require('./empresa');
let app = express();

app.get('/', (req, res) => {
    res.status(204).send("API working successfully");
})

app.use('/empresa', empresaAPI);

module.exports = app;