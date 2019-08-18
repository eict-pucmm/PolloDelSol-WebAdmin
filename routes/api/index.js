const express       = require('express');
const empleadoAPI   = require('./empleado');
const empresaAPI    = require('./empresa');
const itemAPI       = require('./item');
const menuAPI       = require('./menu');
const platoAPI      = require('./platodeldia');
let app = express();

app.use('/item', itemAPI);
app.use('/empresa', empresaAPI);
app.use('/empleado', empleadoAPI);
app.use('/menu', menuAPI);
app.use('/platodeldia', platoAPI);

app.get('/',(req, res) => {
    res.status(200).send({error: false, message: 'API working sucessfully'});
});

app.post('/verifyEmail/(:correo)', (req, res) => {

    req.getConnection((error, conn) => {
        if (!error) {
            conn.query(`UPDATE empleado SET email_verified = 1 WHERE correo = ?`, req.params.correo, (err, results) => {
                if (!err) {
                    res.status(200).send({error: false, result: results, message: 'Empleado ha verificado su correo'});
                } else {
                    res.status(500).send({error: true, message: err});
                }
            });
        } else {
            res.status(500).send({error: true, message: error});
        }
    });
});

app.get('/puntos', (req, res) => {
    
    req.getConnection((error, conn) => {
        if (!error) {
            conn.query(`SELECT * FROM relacionpunto`, (err, rows, fields) => {
                if (!err) {
                    if (rows.length > 0) {
                        res.status(200).send({error: false, valor_puntos: rows[0].pesos_por_punto});
                    } else {
                        res.status(204).send({error: false, message: 'Server request successful but data was not found'});
                    }
                } else {
                    res.status(500).send({error: true, message: err});
                }
            });
        } else {
            res.status(500).send({error: true, message: error});
        }
    });
});

app.post('/puntos', (req, res) => {
    
    req.getConnection((error, conn) => {
        if (!error) {
            conn.query(`UPDATE relacionpunto SET pesos_por_punto = ?`, req.body.puntos, (err, result) => {
                if (!err) {
                    res.status(200).send({error: false, message: 'Puntos modificados'});
                } else {
                    res.status(500).send({error: true, message: err});
                }
            });
        } else {
            res.status(500).send({error: true, message: error});
        }
    });
});


module.exports = app;