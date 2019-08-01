const express = require('express');
const axios =   require('axios');
const url =     require('../../config').values.server.url;

let app =       express();

app.get('/', function (req, res, next) {
        console.log('login');
        res.render('login/login', {
                emailuser: '',
                contrasena: ''
        })
});

app.post('/', function(req,res,next){
        console.log("login inside")

        req.assert('emailuser','El usuario no puede estar vacío').notEmpty();
        req.assert('contrasena','La contraseña no puede estar vacía').notEmpty();

        let errors = req.validationErrors();
        if(!errors) {
                const user = {
                        emailuser: req.sanitize('emailuser').escape().trim(),
                        contrasena: req.sanitize('contrasena').escape().trim(),
                }
                console.log(user);

                axios.post(`${url}/api/empleado/login/${user.emailuser}/${user.contrasena}`, {data: user})
                .then( () => {
                        //render Index
                        res.redirect('/');
                })
                .catch( err => {
                        console.log('Error in login axios')
                        res.redirect('/login/')
                });

        }else {
                req.flash('error', errors[0].msg);
                res.redirect('/login/')
        }

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