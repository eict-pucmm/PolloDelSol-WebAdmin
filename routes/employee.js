const express = require('express');
const firebase = require('firebase/app');
                 require('firebase/auth');
const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const config = require('../config')

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

app.get('/', function(req, res, next){
    req.getConnection(function (error, conn){
        conn.query('SELECT * FROM empleado', function(err, rows, fields){
            if(err){
                req.flash('error', err);
                res.render(
                    'employee/list', {
                    title: 'Lista de empleados',
                    data: ''
                });
            }else{
                res.render(
                    'employee/list', {
                    title: 'Lista de empleados',
                    data: rows
                });
            }
        }); 
    });
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


app.post('/register', parser.single('ProfilePicSelect'), async function(req,res,next){
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

    //AVATAR CAN BE EMPTY, IN WHICH CASE DEFAULT PIC IS TAKEN
    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();
    req.assert('correo', 'El correo no puede estar vacío').notEmpty();
    req.assert('contrasena', 'La contrasena no puede estar vacía.').notEmpty();
    req.assert('contrasenaconfirmada', 'La verificación de contrasena no puede estar vacía.').notEmpty();


    let errors = req.validationErrors();
    // console.log('errors', errors);
    if( !errors ){
        
        
        let employee = {
            avatar:               req.file.url,
            nombre:               req.sanitize('nombre').escape(),
            correo:               req.sanitize('correo').escape().trim(),
            rol:                  req.sanitize('rol').escape().trim(),
            contrasena:           req.sanitize('contrasena').escape().trim(),
            contrasenaconfirmada: req.sanitize('contrasenaconfirmada').escape().trim(),
        };

        if(employee.contrasena != employee.contrasenaconfirmada){
            req.flash('error', 'Las contraseñas digitadas no son iguales.');
            res.redirect(
                '/employee/register'
            );
        }

        
        let sql_query = `INSERT INTO empleado VALUES( 
            '${employee.avatar}',
            '',
            '${employee.nombre}',
            '${employee.correo}',
            '${employee.rol}');
        `;

        firebase.auth().createUserWithEmailAndPassword(employee.correo, employee.contrasena).catch((error) => {
            req.flash('error', error.message);
            res.redirect('/employee/register');
            console.log(error);
        });
        console.log('lo que sea');
        req.getConnection(function(error,conn){
            conn.query(sql_query, function(err, result){
                if(err){
                    req.flash('error', err);
                    res.render(
                        'employee/register', {
                            avatar: '',
                            nombre: employee.nombre,
                            correo: employee.correo,
                            rol: employee.rol,
                            contrasena: '',
                            contrasenaconfirmada: '',
                        }
                    );
                }
                
                    
                req.flash('success', 'Empelado registrado exitosamente');
                res.render(
                    'employee/register', {
                        avatar: '',
                        nombre: '',
                        correo: '',
                        contrasena:'',
                        contrasenaconfirmada: '',
                        rol: '',
                    }
                );
            });
        });

        
    }else {
        req.flash('error', errors[0].msg);
        res.redirect(
            '/employee/register'
        );
    }

    

});

app.get('edit/(:id_empleado)', (req, res, next) => {
    let employee;

    res.render(
        '/employee/register', {
            avatar: '',
            nombre: '',
            correo: '',
            contrasena:'',
            contrasenaconfirmada: '',
            rol: '',
        }
    );
});
module.exports = app;