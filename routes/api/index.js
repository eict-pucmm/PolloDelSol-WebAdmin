const express = require('express');
const empleadoAPI = require('./empleado');
const empresaAPI = require('./empresa');
const itemApi = require('./item');
const menuAPI       = require('./menu');
let app = express();

app.get('/', (req, res) => {
    console.log("API running");
});

app.use('/item', itemAPI);
app.use('/empresa', empresaAPI);
app.use('/empleado', empleadoAPI);
app.use('/menu', menuAPI);

module.exports = app;