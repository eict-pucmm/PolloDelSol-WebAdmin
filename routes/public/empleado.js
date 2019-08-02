const express = require('express');
const axios = require('axios');
const url = require('../../config').values.server.url;
const firebase = require('firebase/app');
                 require('firebase/auth');
const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const config = require('../../config');
const bcrypt = require('bcrypt');
const saltRounds = 10;
let h;

let app = express();

cloudinary.config(config.values.cloudinary);

const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'empleado',
    allowedFormats: ['jpg', 'png'],
    transformation: [{height: 500, crop: 'limit' }],
});
console.log('Initialized Cloudinary on employee public api');

const parser = multer({ storage: storage });

// Initialize Firebase
firebase.initializeApp(config.values.firebaseConfig);
console.log('Initialized firebase on employee public api');

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
            action: 'Registrar',
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

    const file = req.file;

    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();
    req.assert('correo', 'El correo no puede estar vacío').notEmpty();
    req.assert('contrasena', 'La contrasena no puede estar vacía.').notEmpty();
    req.assert('contrasenaconfirmada', 'La verificación de contrasena no puede estar vacía.').notEmpty();

    let contrasena           = req.sanitize('contrasena').escape().trim();
    let contrasenaconfirmada = req.sanitize('contrasenaconfirmada').escape().trim();

    let errors = req.validationErrors();

    if( !errors ) {

        const employee = {
            id_empleado:          '',
            nombre:               req.sanitize('nombre').escape(),
            correo:               req.sanitize('correo').escape().trim(),
            rol:                  req.sanitize('rol').escape().trim(),
            eliminado:            0,
            contrasena:           req.sanitize('contrasena').escape().trim(),
        };

        if(file === undefined || contrasena !== contrasenaconfirmada) {
            req.flash('error', file === undefined ? 'La imagen no puede estar vacía' : 'Las contraseñas deben ser iguales');
            res.render(
                'empleado/register', {
                    action: 'Registrar',
                    employee: {
                        avatar: employee.avatar,
                        nombre: employee.nombre,
                        correo: employee.correo,
                        rol: employee.rol,
                    },
                }
            );
        } else {
            employee.avatar = file.url;
        
            axios.post(`${url}/api/empleado/registrar`, {data: employee})
            .then( () => {      
                req.flash('success', 'Empleado registrado satisfactoriamente')
            }).catch(err => {
                console.log('error in axios');
                req.flash('error', err);
            }).finally(() => {
                console.log('redirected to employee register');
                res.redirect('/empleado/registrar')
            });
        }
    } else {
        req.flash('error', errors[0].msg);
        res.redirect('/empleado/registrar')
    }
});

app.get('/modificar/(:id_empleado)', (req,res,next) =>{


    if(config.loggedIn){
        axios.get(`${url}/api/empleado/buscar?id_empleado=${req.params.id_empleado}`)
    .then(result => {
        let employee = {
            id_empleado: result.data.employee[0].id_empleado,
            avatar: result.data.employee[0].avatar,
            nombre: result.data.employee[0].nombre,
            correo: result.data.employee[0].correo,
            rol: result.data.employee[0].rol,
            eliminado: result.data.employee[0].eliminado,
        }

        let data = {
            action: 'Modificar',
            employee: employee,
        }
        
        res.render('empleado/register', data);
    }).catch(err => {
        res.send(err); 
    });
    }else {
        res.redirect('/login')
    }
    


});

app.post('/modificar/(:id_empleado)', (req, res, next) => {

    const file = req.file;

    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();
    req.assert('correo', 'El correo no puede estar vacío').notEmpty();

    let errors = req.validationErrors();

    if(!errors) {

        const employee = {
            id_empleado:          req.params.id_empleado,
            nombre:               req.sanitize('nombre').escape(),
            correo:               req.sanitize('correo').escape().trim(),
            rol:                  req.sanitize('rol').escape().trim(),
            eliminado:            0
        };

        if (req.file) {
            employee.avatar = file.url;
        }  

        axios.post(`${url}/api/empleado/modificar/${req.params.id_empleado}`, {data: employee})
        .then( () => {
            console.log('Registered employee in database before creating Firebase account');  
            req.flash('success', 'Empleado modificado satisfactoriamente')
        }).catch(err => {
            console.log('error in axios');
            req.flash('error', err);
        }).finally(() => {
            res.redirect('/empleado')
        });

    } else {
        req.flash('error', errors[0].msg);
        res.redirect('/empleado/register')
    }
});


app.post('/eliminar/(:id_empleado)', (req, res, next) => {


    axios.post(`${url}/api/empleado/eliminar/${req.params.id_empleado}`)
    .then(response => {
        req.flash('success', response.data.message);
    })
    .catch(err => console.log(err.message))
    .finally(() => {
        res.redirect(`/empleado/modificar/${req.params.id_empleado}`);
    })
});

module.exports = app;