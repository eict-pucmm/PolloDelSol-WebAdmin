const express = require('express');
const empleadoAPI = require('./empleado');
const empresaAPI = require('./empresa');
const itemApi = require('./item');
let app = express();

app.get('/', (req, res) => {
    res.status(204)
        .send('API working successfully');
});

app.use('/item', itemApi);
app.use('/empresa', empresaAPI);
app.use('/empleado', empleadoAPI);

module.exports = app;