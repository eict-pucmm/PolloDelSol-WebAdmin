const express = require('express');
const itemApi = require('./item');
let app = express();

app.get('/', (req, res) => {
    res.status(204)
        .send('API working successfully');
});

app.use('/item', itemApi);

module.exports = app;