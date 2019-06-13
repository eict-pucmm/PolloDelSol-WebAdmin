const express = require('express');
let app = express();

app.get('/', function (req, res, next) {

    let sql_query = '';
    if (req.query.tipo == 'Todos' || !req.query.tipo)
        sql_query = 'SELECT * FROM item;';
    else
        sql_query = `SELECT * FROM item WHERE tipo = '${req.query.tipo}'`;

    req.getConnection(function (error, conn) {
        conn.query(sql_query, function (err, rows, fields) {
            if (err) {
                req.flash('error', err);
                res.render(
                    'item/list', {
                        filtro_tipo: 'Todos',
                        title: 'Lista de items',
                        data: ''
                    }
                );
            } else {
                res.render(
                    'item/list', {
                        filtro_tipo: req.query.tipo,
                        title: 'Lista de items',
                        data: rows
                    }
                );
            }
        });
    })
});

app.get('/register', function (req, res, next) {
    res.render(
        'item/register', {
            action: 'Registrar',
            id_item: '',
            nombre: '',
            descripcion: '',
            precio: '',
            tipo: ''
        }
    );
});

app.post('/register', function(req, res, next){    
    req.assert('id-item', 'El Id no puede estar vacío').notEmpty();
    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();
    req.assert('descripcion', 'La descripcion no puede estar vacía').notEmpty();
    req.assert('precio', 'El precio no puede estar vacío').notEmpty();

    let errors = req.validationErrors()
    let item = {id: '', nombre: '', descripcion: '', tipo: '', precio: ''};
    
    if( !errors ) {   //No errors were found.  Passed Validation!
        
        item.id = req.sanitize('id-item').escape().trim();
        item.nombre = req.sanitize('nombre').escape().trim();
        item.descripcion = req.sanitize('descripcion').escape().trim();
        item.tipo = req.sanitize('tipo-item').escape().trim();
        item.precio = req.sanitize('precio').escape().trim();

        let sql_query = `INSERT INTO item VALUES (
            '${item.id}',
            '${item.nombre}',
            '${item.descripcion}',
            ${item.precio},
            '${item.tipo}',
            0);`;
        
        req.getConnection(function(error, conn) {
            conn.query(sql_query, function(err, result) {
                if (err) {
                    req.flash('error', err);
                    res.render(
                        'item/register', {
                            action: 'Registrar',
                            id_item: item.id,
                            nombre: item.nombre,
                            descripcion: item.descripcion,
                            precio: item.precio,
                            tipo: item.tipo
                        }
                    );
                } else {
                    req.flash('success', "Item registrado exitosamente!");
                    res.render(
                        'item/register', {
                            action: 'Registrar',
                            id_item: '',
                            nombre: '',
                            descripcion: '',
                            precio: '0',
                            tipo: ''
                        }
                    );
                }
            })
        })
    }
    else {
        req.flash('error', errors[0].msg);
        res.render(
            'item/register', {
                action: 'Registrar',
                id_item: item.id,
                nombre: item.nombre,
                descripcion: item.descripcion,
                precio: item.precio,
                tipo: item.tipo
            }
        );
    }
});

app.get('/edit/(:id_item)', function(req, res, next){
    req.getConnection(function(error, conn) {
        conn.query(`SELECT * FROM item WHERE id_item = '${req.params.id_item}';`, function(err, rows, fields) {
            if(err) throw err;
            
            if (rows.length <= 0) {
                req.flash('error', `No se encontro el item con Id = "${req.params.id_item}"`);
                res.redirect('/item')
            }
            else {
                res.render('item/register', {
                    action: 'Modificar',
                    id_item: rows[0].id_item,
                    nombre: rows[0].nombre,
                    descripcion: rows[0].descripcion,
                    tipo: rows[0].tipo,
                    precio: rows[0].precio                    
                })
            }            
        })
    })
});

app.post('/edit/(:id_item)', function(req, res, next){
    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();
    req.assert('descripcion', 'La descripcion no puede estar vacía').notEmpty();
    req.assert('precio', 'El precio no puede estar vacío').notEmpty();

    let errors = req.validationErrors()
    let item = {id: '', nombre: '', descripcion: '', tipo: '', precio: ''};
    
    if( !errors ) {
        
        item.id = req.sanitize('id-item').escape().trim();
        item.nombre = req.sanitize('nombre').escape().trim();
        item.descripcion = req.sanitize('descripcion').escape().trim();
        item.tipo = req.sanitize('tipo-item').escape().trim();
        item.precio = req.sanitize('precio').escape().trim();

        let sql_query = `UPDATE item SET 
            nombre = '${item.nombre}', 
            descripcion = '${item.descripcion}', 
            tipo = '${item.tipo}', 
            precio = ${item.precio} 
            WHERE id_item = '${item.id}';`;
        
        req.getConnection(function(error, conn) {
            conn.query(sql_query, function(err, result) {
                if (err) {
                    req.flash('error', err);
                    res.render(
                        `item/edit/${item.id}`, {
                            action: 'Modificar',
                            id_item: item.id,
                            nombre: item.nombre,
                            descripcion: item.descripcion,
                            precio: item.precio,
                            tipo: item.tipo
                        }
                    );
                } else {
                    req.flash('success', 'Item modificado satisfactoriamente');
                    res.redirect('/item');
                }
            })
        })
    }
    else {
        req.flash('error', errors[0].msg);
        res.render(
            `item/edit/${item.id}`, {
                action: 'Modificar',
                id_item: item.id,
                nombre: item.nombre,
                descripcion: item.descripcion,
                precio: item.precio,
                tipo: item.tipo
            }
        );
    }
});

app.delete('/delete/(:id)', function(req, res, next) {
    
    req.getConnection(function(error, conn) {
        conn.query(`UPDATE item SET eliminado = 1 WHERE id_item = ${req.params.id_item}`, function(err, result) {
            if (err) {
                req.flash('error', err);
                res.redirect('/item');
            } else {
                req.flash('success', `Se ha eliminado el item con Id = ${req.params.id_item}`);
                res.redirect('/item');
            }
        })
    })
});

module.exports = app;