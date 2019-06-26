const express = require('express');
const axios = require('axios');
const url = require('../../config').server.url;
let app = express();

app.get('/categories', (req, res) => {
    let categorias = [], subcategorias = [];
    req.getConnection((error, conn) => {
        if (!error) {
            conn.query(`SELECT * FROM categoria`, (err, rows, fields) => {
                if (!err) {
                    if (rows.length > 0) {
                        rows.forEach(cat => {
                            if (cat.id_categoria_padre == null) {
                                categorias.push(cat);
                            } else {
                                subcategorias.push(cat);
                            }
                        });
                        res.status(200).send({error: false, categorias: categorias, subcategorias: subcategorias});
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

app.get('/get', (req, res) => {

    let sql_query = `SELECT item.id_item, item.nombre, item.descripcion, categoria.nombre AS categoria, subcategoria.nombre AS subcategoria, item.precio, item.puntos, item.eliminado 
        FROM item, categoria AS categoria, categoria AS subcategoria 
        WHERE item.id_categoria = categoria.id_categoria 
        AND item.id_subcategoria = subcategoria.id_categoria`;

    if (req.query.id_item) {
        sql_query += ` AND item.id_item = '${req.query.id_item}'`;
    }

    if (req.query.categoria) {
        sql_query += ` AND categoria.nombre = '${req.query.categoria}'`;
    }

    if (req.query.subcategoria) {
        sql_query += ` AND subcategoria.nombre = '${req.query.subcategoria}'`;
    }

    req.getConnection((error, conn) => {
        if (!error) {
            conn.query(sql_query, (err, rows, fields) => {
                if (!err) {
                    if (rows.length > 0) {
                        res.status(200).send({error: false, items: rows});
                    } else {
                        res.status(204).send({error: false, message: 'Server request successful but data was not found'});
                    }
                } else {
                    res.status(500).send({error: true, message: err});
                }
            });
        }else{
            res.status(500).send({error: true, message: error});
        }
    })
});

app.post('/register', (req, res) => {

    const item = req.body.data;
    if (!item) {
        res.status(400).send({error: true, message: 'Please provide an item'});
    } else {
        req.getConnection((error, conn) => {
            if (!error) {
                conn.query(`INSERT INTO item SET ?`, item, (err, results) => {
                    if (!err) {
                        res.status(200).send({error: false, result: results, message: 'Item registered sucessfully'});
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

app.post('/edit/(:id_item)', (req, res) => {
    
    const id_item = req.params.id_item;
    const item = req.body.data;

    if (!item || !id_item) {
        res.status(400).send({error: true, message: 'Please provide an item and item id'});
    } else {
        req.getConnection((error, conn) => {
            if (!error) {
                conn.query(`UPDATE item SET ? WHERE id_item = ?`, [item, id_item], (err, results) => {
                    if (!err) {
                        res.status(200).send({error: false, result: results, message: 'Item modificado exitosamente'});
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

app.post('/delete/(:id_item)', (req, res, next) => {

    let item;

    axios.get(`${url}/api/item/get?id_item=${req.params.id_item}`)
        .then(result => {
            item = result.data.items[0];
        }).catch(err => console.log(err))
        .finally( () => {
            req.getConnection((error, conn) => {
                if (!error) {
                    if (item.eliminado === 0) {
                        conn.query(`UPDATE item SET eliminado = 1 WHERE id_item = ?`, item.id_item, (err, result) => {
                            if (!err) {
                                res.status(200).send({error: false, result: result, message: `Se ha cancelado el item con Id = ${req.params.id_item}`});
                            } else {
                                res.status(500).send({error: true, message: err});
                            }
                        })
                    } else {
                        conn.query(`UPDATE item SET eliminado = 0 WHERE id_item = '${req.params.id_item}';`, (err, result) => {
                            if (!err) {
                                res.status(200).send({error: false, result: result, message: `Se ha activado el item con Id = ${req.params.id_item}`});
                            } else {
                                res.status(500).send({error: true, message: err});
                            }
                        });
                    }
                } else {
                    res.status(500).send({error: true, message: error});
                }
            });
        });
});

module.exports = app;