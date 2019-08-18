const express = require('express');
const axios = require('axios');
const url = require('../../config').values.server.url;
const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const config = require('../../config');

let app = express();

cloudinary.config(config.values.cloudinary);

const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'empleado',
    allowedFormats: ['jpg', 'png'],
    transformation: [{height: 500, crop: 'limit' }],
});
const parser = multer({ storage: storage });

app.get('/', (req, res, next) => {
    console.log(config.loggedIn)
    if(config.loggedIn){

        axios.get(`${url}/api/empleado/buscar`).
        then(result => {
            res.render('empleado/list', {data: result.data.employee})
        }).catch(error => {
            res.send(error)
        })
    }else {
        res.redirect('/login')
    }
});

app.get('/registrar', (req, res, next) => {
    
    if(config.loggedIn){
        res.render('empleado/register', {
            action: 'Registrar empleado',
            employee: {
                avatar: '',
                nombre: '',
                correo: '',
                rol: '',
            }
        }
        );
    }else {
        res.redirect('/login')
    }
});

app.post('/registrar', parser.single('ProfilePicSelect'), async (req, res, next) => {

    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();
    req.assert('correo', 'El correo no puede estar vacío').notEmpty();
    req.assert('correo', 'Debe insertar una dirección de correo válida').isEmail().normalizeEmail();
    req.assert('contrasena', 'La contrasena no puede estar vacía.').notEmpty();
    req.assert('contrasenaconfirmada', 'La verificación de contrasena no puede estar vacía.').notEmpty();

    let contrasena = req.sanitize('contrasena').escape().trim();
    let contrasenaconfirmada = req.sanitize('contrasenaconfirmada').escape().trim();

    let errors = req.validationErrors();

    if( !errors ) {

        let empleado = {
            nombre: req.sanitize('nombre').escape(),
            correo: req.sanitize('correo').escape().trim(),
            rol: req.sanitize('rol').escape().trim(),
        };

        if (contrasena.length < 8) {
            if(contrasena !== contrasenaconfirmada) {
                req.flash('error', 'Las contraseñas deben ser iguales');
            } else {
                req.flash('error', 'La contraseña debe tener al menos 8 caracteres');
            }

            res.render(
                'empleado/register', {
                    action: 'Registrar empleado',
                    employee: {
                        nombre: empleado.nombre,
                        correo: empleado.correo,
                        rol: empleado.rol,
                    },
                }
            );
        } else {
            empleado.avatar = req.file ? req.file.url : '';
        
            axios.post(`${url}/api/empleado/registrar`, {empleado: empleado, contrasena: contrasena})
            .then( () => {
                axios.post(`${url}/sendEmailVerification`, {correo: empleado.correo})
                .then(result => {
                    req.flash('success', 'Empleado registrado satisfactoriamente. Se ha enviado un correo de verificación');
                })
                .catch(err => console.log(err))
            }).catch(err => {
                console.log(err)
                req.flash('error', err);
            }).finally(() => {
                res.redirect('/empleado/registrar')
            });
        }
    } else {
        req.flash('error', errors[0].msg);
        res.redirect('/empleado/registrar')
    }
});

app.get('/modificar/(:id_empleado)', (req, res, next) => {


    if(config.loggedIn){
        axios.get(`${url}/api/empleado/buscar?id_empleado=${req.params.id_empleado}`)
        .then(result => {
            res.render('empleado/register', {
                action: 'Modificar empleado',
                employee: result.data.employee[0],
            });
        }).catch(err => {
            res.send(err); 
        });
    } else {
        res.redirect('/login')
    }
});

app.post('/modificar/(:id_empleado)', (req, res, next) => {

    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();

    let errors = req.validationErrors();

    if(!errors) {

        let empleado = {
            nombre: req.sanitize('nombre').escape(),
            rol: req.sanitize('rol').escape().trim(),
        };

        if (req.body.activar) {
            empleado.activo = 1;
        } else if (req.body.cancelar) {
            empleado.activo = 0;
        }

        axios.post(`${url}/api/empleado/modificar/${req.params.id_empleado}`, {empleado: empleado})
        .then( response => {
            req.flash('success', response.data.message)
        }).catch(err => {
            req.flash('error', 'Error al modificar empleado');
        }).finally(() => {
            res.redirect('/empleado')
        });

    } else {
        req.flash('error', errors[0].msg);
        res.redirect(`/empleado/modificar/${req.params.id_empleado}`)
    }
});

module.exports = app;