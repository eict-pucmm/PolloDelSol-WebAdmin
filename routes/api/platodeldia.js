const express = require('express');
const axios = require('axios');
const url = require('../../config').server.url;
let app = express();

app.get('/', (req, res, next) => {
    let menu_pdd_query = `SELECT id_menu, nombre, activo, fecha_creacion FROM menu WHERE plato_del_dia = 1`;
    req.getConnection(function (error, conn){
        conn.query(menu_pdd_query, function(err,menuRows,fields){
            if(!err) {
                res.status(200).send({error: false, menu: menuRows})
            }else{
                res.status(500).send({error: true, message: err})
            }
        });
    });
});

app.get('/edit/(:id_menu)', function (req, res, next) {
    const menu = req.params.id_menu;
    let plato_query         = `SELECT PlatoDelDia.id_plato_del_dia, PlatoDelDia.dia, PlatoDelDia.id_arroz, PlatoDelDia.id_carne, PlatoDelDia.id_guarnicion, PlatoDelDia.id_ensalada FROM PlatoDelDia, menu_PlatoDelDia WHERE menu_platodeldia.id_menu = '${menu}' AND PlatoDelDia.id_plato_del_dia = menu_platodeldia.id_plato_del_dia`;
    let arroz_query         = `SELECT id_item, nombre FROM item where id_categoria = 142 AND id_subcategoria = 152`;
    let guarnicion_query    = `SELECT id_item, nombre FROM item where id_categoria = 62 AND id_subcategoria = 112`;
    let carne_query         = `SELECT id_item, nombre FROM item where id_categoria = 162 AND id_subcategoria = 152`;
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
                                                res.status(200).send({error: false, plato: platoRows, arroz: arrozRows, guarnicion: guarnicionRows, carne: carneRows, ensalada: ensaladaRows, menu: menu});
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

app.post('/edit/(:id_menu)', function (req, res, next) {
    const id_menu = req.params.id_menu;
    const platos = req.body.data;
    var resultados;
    var errores;
    
    if (!id_menu || !platos) {
        res.status(400).send({error: true, message: 'Please provide an item and item id'});
    } else {
        req.getConnection((error, conn) => {
            if (!error) {
                platos.plato.forEach(plate => {
                    conn.query(`UPDATE platodeldia SET dia = ${plate.dia}, id_arroz = '${plate.id_arroz}', id_carne = '${plate.id_carne}', id_guarnicion = '${plate.id_guarnicion}', id_ensalada = '${plate.id_ensalada}' WHERE id_plato_del_dia = '${plate.id_plato_del_dia}'`, (err, results) => {
                        resultados = results;
                        errores = err;
                    });  
                });
                if (errores) {
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