const express = require('express');
const axios = require('axios');
const url = require('../../config').server.url;
let app = express();

app.get('/get', (req, res) => {

    let sql_query = 'Select empleado.avatar, empleado.id_empleado, empleado.nombre, empleado.correo, empleado.rol FROM empleado';

    req.getConnection((error,conn) => {
        if(!error) {
            conn.query(sql_query, (err, rows, fields) => {
                if(!err) {
                    if(rows.lenght > 0){
                        res.status(200).send({error: false, empleados: rows});
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

module.exports = app;