const express = require('express');
const axios = require('axios');
const url = require('../../config').values.server.url;
const multer = require('multer');
const config = require('../../config');
const path = require('path');
const fsExtra = require('fs-extra');

let app = express();

const nombreContenedor = "profilepic";

const storage = multer.diskStorage({
    destination: './tmp',//__dirname,
     filename: function (req, file, cb) {
       cb(null, Date.now() + '-' + file.originalname)
     }
  })

//used to list containers and verify if theres none for employee's profile pic
const listContainers = async () => {
    return new Promise((resolve, reject) => {
        config.blobService.listContainersSegmented(null, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `${data.entries.length} containers`, containers: data.entries });
            }
        });
    });
};

//In any case the db gets erased, creates a new container for employee pictures 
const createContainer = async (containerName) => {
    return new Promise((resolve, reject) => {
        config.blobService.createContainerIfNotExists(containerName, { publicAccessLevel: 'blob' }, err => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `Container '${containerName}' created` });
            }
        });
    });
};

//Uploads employee image on azure storage . Uses /tmp directory to store image and upload it
// as a local file. 
const uploadLocalFile = async (filePath) => {
    return new Promise((resolve, reject) => {
        const fullPath = path.resolve(filePath);
        const blobName = path.basename(filePath);
        config.blobService.createBlockBlobFromLocalFile(nombreContenedor, blobName, fullPath, err => {
            if (err) {
                console.log("errol", err)
                reject(err);
            } else {
                fsExtra.emptyDirSync('./tmp')
                resolve({ message: `Local file "${filePath}" is uploaded` });
            }
        });
    });
};


const parser = multer({ storage: storage });

app.get('/', (req, res, next) => {

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

app.get('/registrar', async (req, res, next) => {

    let response = await listContainers();
    const containerDoesNotExist = response.containers.findIndex((container) => container.name === nombreContenedor) === -1;

    if (containerDoesNotExist) {
        await createContainer(nombreContenedor);
        console.log(`Container ${nombreContenedor} is created`);
    }
    
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
            let response = await uploadLocalFile(req.file.path)
            console.log(response.message)

            employee.avatar = config.blobService.getUrl(nombreContenedor,path.basename(req.file.path));
        
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

app.get('/modificar/(:id_empleado)', (req, res, next) =>{


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
            action: 'Modificar empleado',
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

app.post('/modificar/(:id_empleado)', parser.single('ProfilePicSelect'), async (req, res, next) => {



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

        if (req.file === undefined) {
            employee.avatar = req.body.avatar;
        }else {
            let response = await uploadLocalFile(req.file.path)
            
            employee.avatar = config.blobService.getUrl(nombreContenedor,path.basename(req.file.path));
        }

        axios.post(`${url}/api/empleado/modificar/${req.params.id_empleado}`, {data: employee})
        .then( () => {
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