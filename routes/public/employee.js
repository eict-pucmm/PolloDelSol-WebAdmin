const express = require('express');
const axios = require('axios');
const url = require('../../config').server.url;
const bodyParser = require('body-parser');
let app = express();

app.get('/', (req, res, next) => {
    axios.get(`${url}/api/employee/get`)
});