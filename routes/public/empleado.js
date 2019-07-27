const express = require('express');
const axios = require('axios');
const url = require('../../config').server.url;
const firebase = require('firebase/app');
                 require('firebase/auth');
const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const config = require('../../config')

let app = express();

cloudinary.config(config.cloudinary);

const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'empleado',
    allowedFormats: ['jpg', 'png'],
    transformation: [{height: 500, crop: 'limit' }],
});
console.log('Initialized Cloudinary on employee public api');

const parser = multer({ storage: storage });

// Initialize Firebase
firebase.initializeApp(config.firebaseConfig);
console.log('Initialized firebase on employee public api');

app.get('/', (req, res, next) => {

    axios.get(`${url}/api/empleado/buscar`).
    then(result => {
        res.render('empleado/list', {data: result.data.employee})
    }).catch(error => {
        res.send(error)
    })
});

app.get('/registrar', (req, res, next) => {

        res.render('empleado/register', {
            action: 'Registrar empleado',
            employee: {
                avatar: '',
                nombre: '',
                correo: '',
                rol: '',
            },
        }
    );
});

app.post('/registrar', parser.single('ProfilePicSelect'), (req, res, next) => {

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
            eliminado:            0
        };

        if(file === undefined || contrasena !== contrasenaconfirmada) {
            req.flash('error', file === undefined ? 'La imagen no puede estar vacía' : 'Las contraseñas deben ser iguales');
            res.render(
                'empleado/register', {
                    action: 'Registrar empleado',
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
                console.log('Registered employee in database before creating Firebase account');
                firebase.auth().createUserWithEmailAndPassword(employee.correo, contrasena)
                .then( () => console.log('Firebase account created'))
                .catch((error) => {
                    req.flash('error', error.message);
                    res.redirect('/empleado/registrar');
                    console.log(error);
                });
      
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
            action: 'Modificar empleado',
            employee: employee,
        }
        
        res.render('empleado/register', data);
    }).catch(err => {
        res.send(err); 
    });


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
            eliminado:            req.body.eliminado !== undefined ? 0 : 1,
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

module.exports = app;