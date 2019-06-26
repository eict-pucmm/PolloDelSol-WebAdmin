const express = require('express');
const empresaAPI = require('./empresa');
const itemApi = require('./item');
let app = express();

app.get('/', (req, res) => {
    res.status(204)
        .send('API working successfully');
});

app.use('/item', itemApi);
app.use('/empresa', empresaAPI);

module.exports = app;