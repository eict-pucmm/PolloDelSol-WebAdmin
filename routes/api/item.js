const express = require('express');
const axios = require('axios');
const url = require('../../config').values.server.url;
const {poolPromise} = require('../../db')
const sql = require('mssql')

let app = express();

app.get('/categories', async (req, res) => {
    let sql_query = `SELECT * FROM categoria`;
    let categorias = [], subcategorias = [];
    sql_query += req.query.nombre ? ` AND categoria.nombre = '${req.query.nombre}'` : ``;
    sql_query += req.query.id_categoria ? ` AND categoria.id_categoria = ${req.query.id_categoria}` : ``;
    sql_query += ';'
    try {
        const pool = await poolPromise
        const result = await pool.request()
            .query(sql_query)
            result.recordset.forEach(cat => {
                if (cat.id_categoria_padre == null) {
                    categorias.push(cat);
                } else {
                    subcategorias.push(cat);
                }
            });
        res.status(200).send({error: false, categorias: categorias, subcategorias: subcategorias});
    } catch (err) {
        console.log(err)
        res.status(500).send({error: true, message: err});
    } 
});

app.get('/get', async (req, res) => {

    let sql_query = `SELECT item.id_item, item.nombre, item.descripcion, categoria.nombre AS categoria, subcategoria.nombre AS subcategoria, item.precio, item.eliminado, item.imagen 
        FROM item, categoria AS categoria, categoria AS subcategoria 
        WHERE item.id_categoria = categoria.id_categoria 
        AND item.id_subcategoria = subcategoria.id_categoria`;
    sql_query += req.query.id_item ? ` AND item.id_item = '${req.query.id_item}'` : ``;
    sql_query += req.query.nombre ? ` AND item.nombre = '${req.query.nombre}'` : ``;
    sql_query += req.query.categoria ? ` AND categoria.nombre = '${req.query.categoria}'` : ``;
    sql_query += req.query.subcategoria ? ` AND subcategoria.nombre = '${req.query.subcategoria}'` : ``;
    sql_query += req.query.eliminado ? ` AND item.eliminado = ${req.query.eliminado}` : ``;

    try {
        const pool = await poolPromise
        const result = await pool.request()
            .query(sql_query)
        res.status(200).send({error: false, items: result.recordset});
    } catch (err) {
        console.log(err)
        res.status(500).send({error: true, message: err});
    } 
});

app.get('/get/combo', async (req, res) => {

    let selectComboQuery = `SELECT * FROM combo WHERE id_combo = '${req.query.id_combo}'`;
    let selectItemComboQuery = `SELECT * FROM itemcombo WHERE id_combo = '${req.query.id_combo}'`;

    try {
        const pool = await poolPromise
        const comboresults = await pool.request()
            .query(selectComboQuery)
        const itemcomboresults = await pool.request()
            .query(selectItemComboQuery);
        res.status(200).send({error: false, combo: comboresults.recordset, itemCombo: itemcomboresults.recordset});
    } catch (err) {
        console.log(err)
        res.status(500).send({error: true, message: err});
    } 
});

app.post('/register', async (req, res) => {

    const item = req.body.data;
    var values = [];
    values.push(item.id_item)

    if (!item) {
        res.status(400).send({error: true, message: 'Please provide an item'});
    } else {
        try {
            const pool = await poolPromise
            const result = await pool.request()
                .input('id_item',sql.NVarChar,item.id_item)
                .input('nombre',sql.NVarChar,item.nombre)
                .input('desc',sql.NVarChar,item.descripcion)
                .input('categoria',sql.Int,item.id_categoria)
                .input('subcategoria',sql.Int,item.id_subcategoria)
                .input('precio',sql.Decimal,item.precio)
                .input('eliminado',sql.Bit,item.eliminado)
                .input('imagen',sql.NVarChar,item.imagen)
                .query(`INSERT INTO item VALUES (@id_item, @nombre, @desc, @categoria, @subcategoria, @precio, @eliminado, @imagen)`)
            res.status(200).send({error: false, message: 'Item registered successfully'});
        } catch (err) {
            console.log(err)
            res.status(500).send({error: true, message: err});
        }
    }
});

app.post('/register/combo', async (req, res) => {

    const combo = req.body.combo;
    const itemCombo = req.body.itemCombo;

    if (!combo || !itemCombo) {
        res.status(400).send({error: true, message: 'Please provide combo data'});
    } else {
        try {
            const pool = await poolPromise
            const comboResult = await pool.request()
                .input('id_combo',sql.NVarChar,combo.id_combo)
                .input('guarnicion',sql.Int,combo.max_guarnicion)
                .input('bebida',sql.Int,combo.max_bebida)
                .query(`INSERT INTO combo VALUES (@id_combo, @guarnicion, @bebida)`)
            console.log("combo registrado")
            var values = [];
            itemCombo.forEach(item => {
                var aux = [];
                aux.push(item.id_combo)
                aux.push(item.id_item)
                values.push(aux)
            });
            const table = new sql.Table('itemcombo')
            table.columns.add('id_combo', sql.VarChar(15));
            table.columns.add('id_item', sql.VarChar(15));
            values.forEach(pair => {
                table.rows.add(pair[0], pair[1])
            });
            const itemcomboResult = await pool.request()
                .bulk(table)
            
            res.status(200).send({error: false, message: 'Item registered successfully'});
        } catch (err) {
            console.log(err)
            res.status(500).send({error: true, message: err});
        } 
    }
});

app.post('/edit/(:id_item)', async (req, res) => {
    
    const id_item = req.params.id_item;
    const item = req.body.data;

    if (!item || !id_item) {
        res.status(400).send({error: true, message: 'Please provide an item and item id'});
    } else {
        try {
            const pool = await poolPromise
            const resultes = await pool.request()
                .input('id_item',sql.NVarChar,id_item)
                .input('nombre',sql.NVarChar,item.nombre)
                .input('desc',sql.NVarChar,item.descripcion)
                .input('categoria',sql.Int,item.id_categoria)
                .input('subcategoria',sql.Int,item.id_subcategoria)
                .input('precio',sql.Decimal,item.precio)
                .input('eliminado',sql.Bit,item.eliminado)
                .query(`UPDATE item SET nombre=@nombre, descripcion=@desc, id_categoria=@categoria, id_subcategoria=@subcategoria, precio=@precio, eliminado=@eliminado WHERE id_item = @id_item`)
            res.status(200).send({error: false, result: resultes.recordset,message: "Item modificado exitosamente"});
        } catch (err) {
            console.log(err)
            res.status(500).send({error: true, message: err});
        }
    }
});

app.post('/combo/edit', async (req, res) => {

    console.log(req.body);

    const combo = req.body.combo;
    const itemCombo = req.body.itemCombo;
    let errores = [], resultados = [];

    if (!combo || !itemCombo) {
        res.status(400).send({error: true, message: 'Please provide combo data'});
    } else {
        try {
            const pool = await poolPromise
            const comboResult = await pool.request()
                .input('id_combo',sql.NVarChar,combo.id_combo)
                .input('guarnicion',sql.Int,combo.max_guarnicion)
                .input('bebida',sql.Int,combo.max_bebida)
                .query(`UPDATE combo SET max_guarnicion = @guarnicion, max_bebida = @bebida WHERE id_combo = @id_combo`)
            
            const deleteItemCombo = await pool.request()
                .input('id_combo',sql.NVarChar,combo.id_combo)
                .query('DELETE FROM itemcombo WHERE id_combo = @id_combo')
            var values = [];
            itemCombo.forEach(item => {
                var aux = [];
                aux.push(item.id_combo)
                aux.push(item.id_item)
                values.push(aux)
            });
            const table = new sql.Table('itemcombo')
            table.columns.add('id_combo', sql.VarChar(15));
            table.columns.add('id_item', sql.VarChar(15));
            values.forEach(pair => {
                table.rows.add(pair[0], pair[1])
            });
            const itemcomboResult = await pool.request()
                .bulk(table)
                
            res.status(200).send({error: false, message: 'Item registered successfully'});
        } catch (err) {
            console.log(err)
            res.status(500).send({error: true, message: err});
        } 
    }
});

module.exports = app;