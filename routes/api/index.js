const express       = require('express');
const empresaAPI    = require('./empresa');
const itemAPI       = require('./item');
const menuAPI       = require('./menu');
let app = express();

app.get('/', (req, res) => {
    res.status(204)
        .send('API working successfully');
});

app.use('/item', itemAPI);
app.use('/empresa', empresaAPI);
app.use('/menu', menuAPI);

module.exports = app;