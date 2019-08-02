const express = require('express');
const config  = require('../../config')
let app = express();

app.get('/', (req, res) => {
    if(config.loggedIn){
        res.render('index');
    }else {
        res.redirect('/login')
    }
});

module.exports = app;