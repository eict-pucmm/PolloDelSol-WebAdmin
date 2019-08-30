const express = require('express');
const axios = require('axios');
const url = require('../../config').values.server.url;
const {poolPromise} = require('../../db')
const sql = require('mssql')
let app = express();

app.get('/', async (req, res, next) => {

    let sql_query = `SELECT * FROM menu WHERE plato_del_dia = 1`;

    sql_query += req.query.id_menu ? ` AND id_menu = ${req.query.id_menu}` : ``;
    
    try {
        const pool = await poolPromise
        const menuplatores = await pool.request()
            .query(sql_query)
        res.status(200).send({error: false, menu: menuplatores.recordset});
    } catch (err) {
        console.log(err)
        res.status(500).send({error: true, message: err});
    }
});

app.get('/edit/(:id_menu)', async (req, res, next) => {

    axios.get(`${url}/api/item/get?categoria=Plato del Dia`)
    .then(items => {
        axios.get(`${url}/api/platodeldia?id_menu=${req.params.id_menu}`)
        .then(async (menu) => {
            try {
                const pool = await poolPromise
                const platores = await pool.request()
                    .input("id_menu", sql.Int, req.params.id_menu)
                    .query(`SELECT * FROM platodeldia WHERE id_menu = @id_menu`)
                res.status(200).send({error: false, items: items.data.items,menu: menu.data.menu[0],plato: platores.recordset});
            } catch (err) {
                console.log(err)
                res.status(500).send({error: true, message: err});
            }
        })
        .catch(err => err);
    })
    .catch(err => console.log(err));
});

app.post('/edit/(:id_menu)', async (req, res, next) => {

    const platos = req.body.data.platos;
    /*
    *   Pueden borrar esto ya que no se usan
    */
    
    if (!platos) {
        res.status(400).send({error: true, message: 'Please provide plato del dia data'});
    } else {
        try {
            const pool = await poolPromise
            
            res.status(200).send({error: false, menu: menuplatores.recordset});

            platos.forEach(async (plate) => {
                const platoitemres = await pool.request()
                    .input("arroz", sql.NVarChar, plate.id_arroz)
                    .input("habichuela", sql.NVarChar, plate.id_habichuela)
                    .input("carne", sql.NVarChar, plate.id_carne)
                    .input("guarnicion", sql.NVarChar, plate.id_guarnicion)
                    .input("ensalada", sql.NVarChar, plate.id_ensalada)
                    .input("dia", sql.Int, plate.dia)
                    .input("menu", sql.Int, plate.id_menu)
                    .query(`UPDATE platodeldia SET id_arroz=@arroz, id_habichuela=@habichuela, id_carne=@carne, id_guarnicion=@guarnicion, id_ensalada=@ensalada WHERE id_menu = @menu AND dia = @dia`)
                
            });

            const menuplatores = await pool.request()
                .input("nombre",sql.NVarChar,req.body.data.nombre)
                .input("activo",sql.Bit,req.body.data.activo)
                .input("id",sql.Int,req.params.id_menu)
                .query(`UPDATE menu SET nombre = @nombre, activo = @activo WHERE id_menu = @id;`)
            
        } catch (err) {
            console.log(err)
            res.status(500).send({error: true, message: err});
        }
    }
});


module.exports = app;