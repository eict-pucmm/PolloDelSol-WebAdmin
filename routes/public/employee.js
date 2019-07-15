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
    axios.get(`${url}/api/employee/get`).
    then(result => {
        res.render('employee/list', {data: result.data.employee})
    }).catch(error => {
        res.send(error)
    })
});

app.get('/register', function (req, res, next) {
    let employee = {
        avatar: '',
        nombre: '',
        correo: '',
        contrasena:'',
        contrasenaconfirmada: '',
        rol: '',
    };

    let data = {
        action: 'Registrar',
        employee: employee,
    }
    res.render(
        'employee/register', data
    );
});

app.post('/register', parser.single('ProfilePicSelect'), function (req, res, next) {
    if(!req.file){
        req.flash('Error', 'La imagen no puede estar vacía.');
        res.redirect(
            '/employee/register', {
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
        let employee = {
            avatar:               req.file.url,
            id_empleado:          '',
            nombre:               req.sanitize('nombre').escape(),
            correo:               req.sanitize('correo').escape().trim(),
            rol:                  req.sanitize('rol').escape().trim(),
            eliminado:            0
        };
        axios.post(`${url}/api/employee/register`, {data: employee})
        .then( () => {
            console.log('before auth');
            firebase.auth().createUserWithEmailAndPassword(employee.correo, contrasena)
            .catch((error) => {
                req.flash('error', error.message);
                res.redirect('/employee/register');
                console.log(error);
            });

            

            
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

app.get('/edit/(:id_empleado)', (req,res,next) =>{


    axios.get(`${url}/api/employee/get?id_empleado=${req.params.id_empleado}`)
    .then(result => {
        let employee = {
            id_empleado: result.data.employee[0].id_empleado,
            avatar: result.data.employee[0].avatar,
            nombre: result.data.employee[0].nombre,
            correo: result.data.employee[0].correo,
            contrasena:'',
            contrasenaconfirmada: '',
            rol: result.data.employee[0].rol,
            eliminado: result.data.employee[0].eliminado,
        }

        let data = {
            action: 'Modificar',
            employee: employee,
        }
        
        res.render('employee/register', data);
    }).catch(err => {
        res.send(err); 
    });


});

app.post('/edit/(:id_empleado)', function (req,res,next) {
    

    console.log('req.body: ', req.body);
    let employee = {
        id_empleado: req.body.id_empleado,
        avatar: req.body.avatar,
        nombre: req.body.nombre,
        correo: req.body.correo,
        rol: req.sanitize('rol').escape().trim(),
        eliminado: req.body.eliminado,
    }

    console.log('modified employee: ', employee);

    if(employee) {
        axios.post(`${url}/api/employee/edit/${employee.id_empleado}`, {data: employee})
        .then(response => {
            if (!response.data.error) {
                req.flash('success', response.data.message);
                res.redirect('/employee');
            } else {
                req.flash('error', response.data.message);
                res.redirect(`/employee/edit/${employee.id_empleado}`);
            }
        })
        .catch(err => console.log(err));
    }
});


app.post('/delete/(:id_empleado)', (req, res, next) => {


    axios.post(`${url}/api/employee/delete/${req.params.id_empleado}`)
    .then(response => {
        req.flash('success', response.data.message);
    })
    .catch(err => console.log(err.message))
    .finally(() => {
        res.redirect(`/employee/edit/${req.params.id_empleado}`);
    })
});

module.exports = app;