const express = require('express');
let app = express();

app.get('/get', function (req, res, next) {

    let sql_query = 'Select empleado.avatar, empleado.id_empleado, empleado.nombre, empleado.correo, empleado.rol FROM empleado';
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

app.post('/register', (req,res) => {

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

module.exports = app;