const express = require('express');
const empleadoAPI = require('./empleado');
const empresaAPI = require('./empresa');
const itemAPI = require('./item');
const menuAPI       = require('./menu');
const platoAPI      = require('./platodeldia');
let app = express();

app.get('/', (req, res) => {
    console.log("API running");
});

app.use('/item', itemAPI);
app.use('/empresa', empresaAPI);
app.use('/empleado', empleadoAPI);
app.use('/menu', menuAPI);
app.use('/platodeldia', platoAPI);

module.exports = app;