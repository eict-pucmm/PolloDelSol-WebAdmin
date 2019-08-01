const express   = require('express');
const axios     = require('axios');
const config    = require('../../config');
const bcrypt    = require('bcrypt');
// let logIn       = require('../../config').loggedIn.loggedIn;
let h;
let app = express();

app.get('/buscar', (req, res, next) => {

    let sql_query = `SELECT * FROM empleado`;
    
    if (req.query.id_empleado) {
        sql_query += ` WHERE empleado.id_empleado = ${req.query.id_empleado}`;
    }
    if (req.query.correo) {
        sql_query += ` WHERE empleado.correo = "${req.query.correo}"`;
    }
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

app.get('/buscarContrasena', (req,res,next) => {
    let sql_query = `SELECT * FROM credencial`;

    if(req.query.id_empleado) {
        sql_query += ` WHERE credencial.id_empleado = ${req.query.id_empleado}`
    }

    req.getConnection((error,conn) => {
        if(!error) {
            conn.query(sql_query, (err, rows, fields) => {
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

app.post('/registrar', async (req,res) => {

    const employee1 = req.body.data;
    const employee = {
        id_empleado: employee1.id_empleado,
        nombre:      employee1.nombre,
        correo:      employee1.correo,
        rol:         employee1.rol,
        eliminado:   employee1.eliminado,
        avatar:      employee1.avatar,
    }
    console.log(employee1)

    if(!employee){
        res.status(400).send({error: true, message: 'Please provide an employee'});
    } else {
        console.log("Employee data: ",employee)
        req.getConnection((error, conn) => {
            if( !error ) {
                conn.query(`INSERT INTO empleado SET ?`, employee, async (err, results) => {
                    console.log("Inside Query 1")
                    let id = results.insertId
                    if (!err) {
                                try {
                                    console.log("Lets hash")
                                    h = await bcrypt.hash(employee1.contrasena, 10);
                                } catch (error) {
                                    console.log(error)
                                }
                                console.log(h);
                                let credencial = {
                                    id_credencial: '',
                                    id_empleado: id,
                                    hash_password: h,
                                    fecha: new Date().toISOString().slice(0, 19).replace('T', ' ')
                                }
                                console.log("Some nice credentials",credencial)
                                conn.query(`INSERT INTO credencial SET ?`, credencial, (er) => {
                                    console.log("last query is in")
                                    if(!er){
                                        res.status(200).send({error: false, result: results, message: 'Employee registered sucessfully'});
                                    }else {
                                        conn.query(`DELETE FROM empleado WHERE id_empleado = ?`, credencial.id_empleado);
                                        console.log(er)
                                    }
                                })
                        
                    } else {
                        console.log("Error in query 1", err)
                        res.status(500).send({error: true, message: err});
                    }
                })
            } else {
                res.status(500).send({error: true, message: error});
            }
        });
    }
});

app.post('/modificar/(:id_empleado)', (req,res) => {

    const id_empleado = req.params.id_empleado;
    const empleado = req.body.data;

    if(!empleado || !id_empleado) {
        res.status(400).send({error: true, message: 'Please provide an employee and employee id'});
    } else {
        req.getConnection((error, conn) => {
            if (!error) {
                conn.query(`UPDATE empleado SET ? WHERE id_empleado = ?`, [empleado, id_empleado], (err, results) => {
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
    }
});

app.post('/eliminar/(:id_empleado)', (req, res, next) => {

    let employee;

    axios.get(`${config.values.server.url}/api/empleado/buscar?id_empleado=${req.params.id_empleado}`)
    .then(result => {
        employee = result.data.employee[0];
    })
    .catch(err => {console.log(err)})
    .finally(() => {
        req.getConnection((error,conn) => {
            if(!error){
                if(employee.eliminado === 0) {
                    conn.query(`UPDATE empleado SET eliminado = 1 WHERE id_empleado = ?`, employee.id_empleado, (err, result) => {
                        if (!err) {
                            res.status(200).send({error: false, result: result, message: `Se ha cancelado el empleado con Id = ${req.params.id_empleado}`});
                        } else {
                            res.status(500).send({error: true, message: err});
                        }
                    })
                } else {
                    conn.query(`UPDATE empleado SET eliminado = 0 WHERE id_empleado = '${req.params.id_empleado}';`, (err, result) => {
                        if (!err) {
                            res.status(200).send({error: false, result: result, message: `Se ha activado el empleado con Id = ${req.params.id_empleado}`});
                        } else {
                            res.status(500).send({error: true, message: err});
                        }
                    });
                }
            } else {
                res.status(500).send({error: true, message: error});
            }
        })
    })
});

app.post('/login/(:emailuser)/(:contrasena)', async (req,res,next) => {
    
    let employee;

    await axios.get(`${config.values.server.url}/api/empleado/buscar?correo=${req.params.emailuser}`)
    .then(result => {
        employee = result.data.employee[0];
        console.log(employee.correo, employee.id_empleado);
    })
    .catch(err => {console.log(err)});

    await axios.get(`${config.values.server.url}/api/empleado/buscarContrasena?id_empleado=${employee.id_empleado}`)
    .then(result => {
        credencial = result.data.credencial[0];
        console.log(credencial.id_credencial , credencial.id_empleado);
    })

    let hashedPass = new Buffer.from(credencial.hash_password).toString('UTF-8');
    
    await bcrypt.compare(req.params.contrasena, hashedPass)
    .then((result,error) => {
        console.log("res result",result)
        if(result) {
            if(employee.rol === 'Administrador'){
                config.loggedIn = true;
                console.log(config.loggedIn);
                res.status(200).send({error: false, result: result, message: `Usuario ${employee.nombre} ha iniciado sesion`});
                
            }
        }else {
            console.log(error)
            res.status(500).send({error: true, message: error})
        }
    })
});

module.exports = app;