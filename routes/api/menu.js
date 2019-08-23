const express = require('express');
let app = express();
const {poolPromise} = require('../../db')
const sql = require('mssql')

app.get('/', async (req, res) => {

    let sql_query = `SELECT * FROM menu WHERE plato_del_dia = 0`;

    sql_query += req.query.id_menu ? ` AND id_menu = ${req.query.id_menu};` : ``;
    sql_query += req.query.activo ? ` AND activo = ${req.query.activo};` : ``;

    try {
        const pool = await poolPromise
        const menures = await pool.request()
            .query(sql_query)
        res.status(200).send({error: false, menus: menures.recordset});
    } catch (err) {
        console.log(err)
        res.status(500).send({error: true, message: err});
    }

    /*req.getConnection((error, conn) => {
        if (!error) {
            conn.query(sql_query, (err, rows, fields) => {
                if (!err) {
                    if (rows.length > 0) {
                        res.status(200).send({error: false, menus: rows});
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
    });*/

});

app.get('/items', async (req, res) => {

    let sql_query = `SELECT combo.id_item, combo.nombre, combo.descripcion, combo.categoria, combo.subcategoria, combo.precio, combo.puntos, combo.eliminado, combo.imagen  
        FROM (SELECT item.id_item, item.nombre, item.descripcion, categoria.nombre AS categoria, subcategoria.nombre AS subcategoria, item.precio, item.precio * (select pesos_por_punto from relacionpunto) AS puntos, item.eliminado, item.imagen 
                FROM item, categoria AS categoria, categoria AS subcategoria, relacionpunto 
                WHERE item.id_categoria = categoria.id_categoria 
                AND item.id_subcategoria = subcategoria.id_categoria) AS combo, menuitem`
    
    sql_query += req.query.activo ? ', menu' : '';
        
    sql_query += ` WHERE combo.id_item = menuitem.id_item`;
    
    sql_query += req.query.activo ? ` AND menuitem.id_menu = menu.id_menu AND menu.activo = ${req.query.activo}` : ` AND menuitem.id_menu = ${req.query.id_menu}`;

    try {
        const pool = await poolPromise
        const menuitemres = await pool.request()
            .query(sql_query)
        res.status(200).send({error: false, menu_items: menuitemres.recordset});
    } catch (err) {
        console.log(err)
        res.status(500).send({error: true, message: err});
    }
    /*req.getConnection((error, conn) => {
        if (!error) {
            conn.query(sql_query, (err, rows, fields) => {
                if (!err) {
                    if (rows.length > 0) {
                        res.status(200).send({error: false, menu_items: rows});
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
    });*/
});

app.post('/register', async (req, res) => {
    console.log(req.body);
    let sql_query = `INSERT INTO menu (nombre, plato_del_dia) VALUES ('${req.body.name}', ${req.body.plato_del_dia});`;

    try {
        const pool = await poolPromise
        const menures = await pool.request()
            .query(sql_query)
        res.status(200).send({error: false, result: menures.recordset, message: 'Menu registered sucessfully'});
    } catch (err) {
        console.log(err)
        res.status(500).send({error: true, message: err});
    }

    /*req.getConnection((error, conn) => {
        if (!error) {
            conn.query(sql_query, (err, results) => {
                if (!err) {
                    res.status(200).send({error: false, result: results, message: 'Menu registered sucessfully'});
                } else {
                    res.status(500).send({error: true, message: err});
                }
            });
        } else {
            res.status(500).send({error: true, message: error});
        }
    });*/
});

app.post('/edit/(:id_menu)', async (req, res) => {

    const toDelete = req.body.deleted;
    const toInsert = req.body.inserted;

    try {
        const pool = await poolPromise
        if (toDelete && (toDelete.length > 0)) {
            toDelete.forEach(async (id) => {
                var deleteres = await pool.request()
                    .query(`DELETE FROM menuitem WHERE id_item = '${id}' AND id_menu = ${req.params.id_menu};`)
                console.log(`UNLINKED ITEM: ${id} TO MENU: ${req.params.id_menu}`);
            });
        }

        if (toInsert && (toInsert.length > 0)) {
            toInsert.forEach(async (id) => {
                var insertres = await pool.request()
                    .query(`INSERT INTO menuitem VALUES (${req.params.id_menu}, '${id}');`)
                console.log(`LINKED ITEM: ${id} TO MENU: ${req.params.id_menu}`);
            });
        }
        const menures = await pool.request()
            .input("nombre",sql.NVarChar,req.body.nombre)
            .input("activo",sql.Bit,req.body.activo)
            .input("id_menu",sql.Int,req.params.id_menu)
            .query(`UPDATE menu SET nombre = @nombre, activo = @activo WHERE id_menu = @id_menu;`)
        res.status(200).send({error: false, menus: menures.recordset});
    } catch (err) {
        console.log(err)
        res.status(500).send({error: true, message: err});
    }

    /*req.getConnection((error, conn) => {
        if (!error) {
            if (toDelete && (toDelete.length > 0)) {
                toDelete.forEach(id => {
                    conn.query(`DELETE FROM menuitem WHERE id_item = '${id}' AND id_menu = ${req.params.id_menu};`, (err, results) => {
                        if (!err) {
                            console.log(`UNLINKED ITEM: ${id} TO MENU: ${req.params.id_menu}`);
                        }
                    })
                });
            }

            if (toInsert && (toInsert.length > 0)) {
                toInsert.forEach(id => {
                    conn.query(`INSERT INTO menuitem VALUES (${req.params.id_menu}, '${id}');`, (err, results) => {
                        if (!err) {
                            console.log(`LINKED ITEM: ${id} TO MENU: ${req.params.id_menu}`);
                        }
                    })
                });
            }
            
            conn.query(`UPDATE menu SET nombre = ?, activo = ? WHERE id_menu = ?;`, [req.body.nombre, req.body.activo, req.params.id_menu], (err, results) => {
                if (!err) {
                    res.status(200).send({error: false, message: 'El menú ha sido editado satisfactoriamente'});
                } else {
                    console.log(err);
                }
            })
        } else {
            res.status(500).send({error: true, message: error});
        }
    });*/
});

module.exports = app;