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
    folder: 'Empresa',
    allowedFormats: ['jpg', 'png'],
    transformation: [{height: 500, crop: 'limit' }],
});

const parser = multer({ storage: storage });

// Initialize Firebase
firebase.initializeApp(config.firebaseConfig);
console.log('initialized Firebase >>');

app.get('/', (req, res, next) => {
    console.log("DQWINOWQDNOQIWDNQWOIDQW");
    axios.get(`${url}/api/employee/get`).
    then(result => {
        res.render('employee/list', {data: result.data.employee})
    }).catch(error => {
        res.send(error)
    })
});

app.get('/register', function (req, res, next) {
    res.render(
        'employee/register', {
            avatar: '',
            nombre: '',
            correo: '',
            contrasena:'',
            contrasenaconfirmada: '',
            rol: '',
            eliminado: 0,
        }
    );
});

app.post('/register', parser.single('ProfilePicSelect'), function (req, res, next) {
    if(!req.file){
        // res.status(401).json({error: 'Please provide an image'});
        req.flash('Error', 'La imagen no puede estar vacía.');
        res.redirect(
            '/employee/register', {
                // avatar: employee.avatar,
                avatar: '',
                nombre: employee.nombre,
                correo: employee.correo,
                contrasena:employee.contrasena,
                contrasenaconfirmada: employee.contrasenaconfirmada,
                rol: employee.rol,
            }
        );
    }

    let file = req.file;

    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();
    req.assert('correo', 'El correo no puede estar vacío').notEmpty();
    req.assert('contrasena', 'La contrasena no puede estar vacía.').notEmpty();
    req.assert('contrasenaconfirmada', 'La verificación de contrasena no puede estar vacía.').notEmpty();

    
    let contrasena =           req.sanitize('contrasena').escape().trim();
    let contrasenaconfirmada = req.sanitize('contrasenaconfirmada').escape().trim();

    if(!(contrasena === contrasenaconfirmada)){
        req.flash('error', 'Las contraseñas digitadas no son iguales.');
        res.redirect(
            '/employee/register'
        );
    }

    let errors = req.validationErrors();

    if( !errors ) {
        console.log('No errors');
        let employee = {
            avatar:               req.file.url,
            id_empleado:          '',
            nombre:               req.sanitize('nombre').escape(),
            correo:               req.sanitize('correo').escape().trim(),
            rol:                  req.sanitize('rol').escape().trim()
        };
        console.log('employee var created');
        axios.post(`${url}/api/employee/register`, {data: employee})
        .then( () => {
            console.log('before auth');
            firebase.auth().createUserWithEmailAndPassword(employee.correo, contrasena).catch((error) => {
                req.flash('error', error.message);
                res.redirect('/employee/register');
                console.log(error);
            });
            console.log('after auth');

            req.flash('success', 'Empleado registrado satisfactoriamente')
        }).catch(err => {
            console.log('error in axios');
            req.flash('error', err);
        }).finally(() => {
            console.log('redirected to employee register');
            res.redirect('/employee/register')
        });

    } else {
        req.flash('error', errors[0].msg);
        res.redirect('/employee/register')
    }
});

module.exports = app;