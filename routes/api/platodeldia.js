const express = require('express');
const axios = require('axios');
const url = require('../../config').values.server.url;
let app = express();

app.get('/', (req, res, next) => {

    let sql_query = `SELECT * FROM menu WHERE plato_del_dia = 1`;

    sql_query += req.query.id_menu ? ` AND id_menu = ${req.query.id_menu}` : ``;
    
    req.getConnection((error, conn) => {
        if (!error) {
            conn.query(sql_query, (err, rows, fields) => {
                if(!err) {
                    res.status(200).send({error: false, menu: rows});
                }
            });
        } else {
            res.status(500).send({error: true, message: err});
        }
    });
});

app.get('/edit/(:id_menu)', (req, res, next) => {

    axios.get(`${url}/api/item/get?categoria=Plato del Dia`)
    .then(items => {
        axios.get(`${url}/api/platodeldia?id_menu=${req.params.id_menu}`)
        .then(menu => {
            req.getConnection((error, conn) => {
                if (!error) {
                    conn.query(`SELECT * FROM platodeldia WHERE id_menu = ?`, req.params.id_menu, (err, rows, fields) => {
                        if (!err) {
                            res.status(200).send({error: false, items: items.data.items, menu: menu.data.menu[0], plato: rows});
                        }
                    });
                } else {
                    res.status(500).send({error: true, message: err});
                }
            })
        })
        .catch(err => err);
    })
    .catch(err => console.log(err));
});

app.post('/edit/(:id_menu)', (req, res, next) => {

    const platos = req.body.data.platos;
    const sql_query = `UPDATE platodeldia SET ? WHERE id_menu = ? AND dia = ?`;
    let resultados = [], errores = [];
    
    if (!platos) {
        res.status(400).send({error: true, message: 'Please provide plato del dia data'});
    } else {
        req.getConnection((error, conn) => {
            if (!error) {
                platos.forEach(plate => {
                    conn.query(sql_query, [plate, plate.id_menu, plate.dia], (err, results) => {
                        resultados.push(results);
                        errores.push(err);
                    });  
                });
                conn.query(`UPDATE menu SET nombre = ?, activo = ? WHERE id_menu = ?;`, [req.body.data.nombre, req.body.data.activo, req.params.id_menu], (err, results) => {
                    resultados.push(results);
                    errores.push(err);
                });
                if (errores.length > 0) {
                    res.status(500).send({error: true, message: errores});
                }else{
                    res.status(200).send({error: false, result: resultados, message: 'Menu modificado exitosamente'});
                }
            } else {
                res.status(500).send({error: true, message: error});
            }
        });
    }
});


module.exports = app;