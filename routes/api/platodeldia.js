const express = require('express');
const axios = require('axios');
const url = require('../../config').server.url;
let app = express();


app.get('/edit/(:id_menu)', function (req, res, next) {
    let plato_query         = `SELECT PlatoDelDia.id_plato_del_dia, PlatoDelDia.dia, PlatoDelDia.id_arroz, PlatoDelDia.id_carne, PlatoDelDia.id_guarnicion, PlatoDelDia.id_ensalada FROM PlatoDelDia, Menu_PlatoDelDia WHERE PlatoDelDia.id_plato_del_dia = Menu_PlatoDelDia.id_plato_del_dia AND Menu_PlatoDelDia.id_menu = '${req.query.id_menu}'`;
    let arroz_query         = `SELECT id_item, nombre FROM item where id_categoria = 142 AND id_subcategoria = 152`;
    let guarnicion_query    = `SELECT id_item, nombre FROM item where id_categoria = 62 AND id_subcategoria = 112`;
    let carne_query         = `SELECT id_item, nombre FROM item where id_categoria = 142 AND id_subcategoria = 152`;
    let ensalada_query      = `SELECT id_item, nombre FROM item where id_categoria = 142 AND id_subcategoria = 152`;
    req.getConnection(function (error, conn) {
        conn.query(plato_query, function (err, platoRows, fields) {
            if (!err) {
                conn.query(arroz_query, function (err1, arrozRows, fields) {
                    if (!err1) {
                        conn.query(guarnicion_query, function (err2, guarnicionRows, fields) {
                            if (!err2) {
                                conn.query(carne_query, function (err3, carneRows, fields) {
                                    if (!err3) {
                                        conn.query(ensalada_query, function (err4, ensaladaRows, fields) {
                                            if (!err4) {
                                                res.status(200).send({error: false, plato: platoRows, arroz: arrozRows, guarnicion: guarnicionRows, carne: carneRows, ensalada: ensaladaRows});
                                            } else {
                                                res.status(500).send({error: true, message: err4});
                                            }
                                        });
                                    } else {
                                        res.status(500).send({error: true, message: err3});
                                    }
                                });
                            } else {
                                res.status(500).send({error: true, message: err2});
                            }
                        });
                    } else {
                        res.status(500).send({error: true, message: err1});
                    }
                });
            } else {
                res.status(500).send({error: true, message: err});
            }
        });
    })
});


module.exports = app;