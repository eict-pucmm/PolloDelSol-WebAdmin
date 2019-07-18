const express = require('express');
const axios = require('axios');
const url = require('../../config').server.url;
let app = express();

app.get('/buscar', (req, res, next) => {

    let sql_query = `SELECT * FROM empleado`;
    
    if (req.query.id_empleado) {
        sql_query += ` WHERE empleado.id_empleado = ${req.query.id_empleado}`;
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

app.post('/registrar', (req,res) => {

    const employee = req.body.data;

    if(!employee){
        res.status(400).send({error: true, message: 'Please provide an employee'});
    } else {
        req.getConnection((error, conn) => {
            if( !error ) {
                conn.query(`INSERT INTO empleado SET ?`, employee, (err, results) => {
                    if (!err) {
                        res.status(200).send({error: false, result: results, message: 'Employee registered sucessfully'});
                    } else {
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

    axios.get(`${url}/api/empleado/buscar?id_empleado=${req.params.id_empleado}`)
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

module.exports = app;