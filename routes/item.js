const express = require('express');
let app = express();

app.get('/', function (req, res, next) {
    req.getConnection(function (error, conn) {
        conn.query('SELECT * FROM item WHERE eliminado = 0', function (err, rows, fields) {
            if (err) {
                req.flash('error', err);
                res.render(
                    'item/list', {
                        title: 'Lista de items',
                        data: ''
                    }
                );
            } else {
                res.render(
                    'item/list', {
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
    
    if( !errors ) {   //No errors were found.  Passed Validation!
        
        let item = {
            id: req.sanitize('id-item').escape().trim(),
            nombre: req.sanitize('nombre').escape().trim(),
            descripcion: req.sanitize('descripcion').escape().trim(),
            tipo: req.sanitize('tipo-item').escape().trim(),
            precio: req.sanitize('precio').escape().trim()
        };

        let sql_query = "INSERT INTO item VALUES ('" +
            item.id + "', '" +
            item.nombre + "', '" +
            item.descripcion + "', " +
            item.precio + ", '" +
            item.tipo + "', 0);";
        
        req.getConnection(function(error, conn) {
            conn.query(sql_query, function(err, result) {
                if (err) {
                    req.flash('error', err);
                    res.render(
                        'item/register', {
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
                id_item: '',
                nombre: '',
                descripcion: '',
                precio: '',
                tipo: ''
            }
        );
    }
})

module.exports = app;