const express = require('express');
let app = express();

app.get('/', function (req, res, next) {
        res.render('login/login')
});

app.post('/', function(req,res,next){

});

app.get('/logout', function(req,res,next){
        if (req.session) {
                req.session.destroy(function (err) {
                        if(err){
                                next(err);
                        }else{
                                res.redirect('/login');
                        }
                });
        }
});

module.exports = app;