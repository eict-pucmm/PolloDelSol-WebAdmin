const express   = require('express');
const axios     = require('axios');
const config    = require('../../config');
const bcrypt    = require('bcrypt');
let app = express();

app.get('/buscar', (req, res, next) => {

    let sql_query = `SELECT * FROM empleado`;

    sql_query += req.query.id_empleado ? ` WHERE id_empleado = ${req.query.id_empleado}` : ``;
    sql_query += req.query.correo ? ` WHERE correo = '${req.query.correo}'` : ``;
    
    req.getConnection((error,conn) => {
        if(!error) {
            conn.query(sql_query, (err, rows, fields) => {
                if(!err) {
                    if(rows.length > 0){
                        res.status(200).send({error: false, employee: rows});
                    } else {
                        res.status(204).send({error: false, message: 'Server request successful but data was not found'});
                    }
                }else {
                    res.status(500).send({error: true, message: err});
                }
        });      
        }else {
            res.status(500).send({error: true, message: error});
        }   
    })
});

app.get('/credencial/(:id_empleado)', (req, res, next) => {

    req.getConnection((error,conn) => {
        if(!error) {
            conn.query(`SELECT * FROM credencial WHERE id_empleado = ?`, req.params.id_empleado, (err, rows, fields) => {
                if(!err){
                    if(rows.length > 0) {
                        res.status(200).send({error: false, credencial: rows});
                    } else {
                        res.status(204).send({error: false, message: 'Server request successful but data was not found'})
                    }
                }else {
                    res.status(500).send({error: true, message: err});
                }
            })
        } else {
            res.status(500).send({error: true, message: err});
        }
    });
});

app.post('/registrar', async (req, res) => {

    const empleado = req.body.empleado;
    const contrasena = req.body.contrasena;

    req.getConnection((error, conn) => {
        if( !error ) {
            conn.query(`INSERT INTO empleado SET ?`, empleado, async (err1, results) => {
                let hash;
                if (!err1) {
                    try {
                        hash = await bcrypt.hash(contrasena, 10);
                    } catch (error) {
                        console.log(error)
                    }
                    let credencial = {
                        id_empleado: results.insertId,
                        hash_password: hash,
                        fecha: new Date().toISOString().slice(0, 19).replace('T', ' ')
                    }
                    conn.query(`INSERT INTO credencial SET ?`, credencial, (err2) => {
                        if(!err2){
                            res.status(200).send({error: false, result: results, message: 'Employee registered sucessfully'});
                        }else {
                            conn.query(`DELETE FROM empleado WHERE id_empleado = ?`, credencial.id_empleado);
                        }
                    })
                    
                } else {
                    res.status(500).send({error: true, message: err1});
                }
            })
        } else {
            res.status(500).send({error: true, message: error});
        }
    });
});

app.post('/modificar/(:id_empleado)', (req,res) => {

    const empleado = req.body.empleado;

    req.getConnection((error, conn) => {
        if (!error) {
            conn.query(`UPDATE empleado SET ? WHERE id_empleado = ?`, [empleado, req.params.id_empleado], (err, results) => {
                if (!err) {
                    res.status(200).send({error: false, result: results, message: 'Empleado modificado exitosamente'});
                } else {
                    res.status(500).send({error: true, message: err});
                }
            });
        } else {
            res.status(500).send({error: true, message: error});
        }
    });
});

app.post('/login', async (req, res, next) => {

    const email = req.body.email;
    const password = req.body.passwd;

    await axios.get(`${config.values.server.url}/api/empleado/buscar?correo=${email}`)
    .then(async (result) => {
        if (!result.data.employee) {
            res.status(412).send({error: true, message: 'No se encontró un empleado con ese correo'});
        } else {
            const employee = result.data.employee[0];

            if (employee.rol !== 'Administrador') {
                res.status(412).send({error: true, message: 'El correo no pertenece a un administrador/a'});
            } else if (!employee.activo) {
                res.status(412).send({error: true, message: 'El empleado con éste correo no está activado'});
            } else {
                let credencial = {};
                await axios.get(`${config.values.server.url}/api/empleado/credencial/${employee.id_empleado}`)
                .then(result => {
                    credencial = result.data.credencial[0];
                })
        
                let hashedPass = new Buffer.from(credencial.hash_password).toString('UTF-8');
                
                await bcrypt.compare(password, hashedPass)
                .then((result, error) => {
                    if(result) {
                        config.loggedIn = true;
                        config.employee = employee;
                        res.status(200).send({error: false, result: result, message: 'Incio de sesión satisfactorio'});
                    } else {
                        console.log(error);
                        res.status(500).send({error: true, message: error})
                    }
                }).catch(err => console.log(err));
            }
        }
    })
    .catch(err => {console.log(err)});

    
});

module.exports = app;