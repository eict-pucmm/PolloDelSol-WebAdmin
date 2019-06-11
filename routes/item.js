const express = require('express');
let app = express();

app.get('/', function (req, res, next) {
    req.getConnection(function (error, conn) {
        conn.query('SELECT * FROM item', function (err, rows, fields) {
            if (err) {
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
            precio: '0',
            tipo: ''
        }
    );
});

app.post('/register', function(req, res, next){    
    req.assert('id-item', 'Id is required').notEmpty()           //Validar id
    req.assert('nombre', 'Nombre is required').notEmpty()           //Validar nombre
    req.assert('descripcion', 'Descripcion is required').notEmpty()           //Validar descripcion
 
    let errors = req.validationErrors()
    
    if( !errors ) {   //No errors were found.  Passed Validation!
        
        // let item = {
        //     id_item: req.sanitize('id-item').escape().trim(),
        //     nombre: req.sanitize('nombre').escape().trim(),
        //     descripcion: req.sanitize('descripcion').escape().trim(),
        //     tipo: req.sanitize('tipo-item').escape().trim(),
        //     precio: req.sanitize('precio').escape().trim()
        // }

        let sql_query = "INSERT INTO item VALUES ('" +
            req.sanitize('id-item').escape().trim() + "', '" +
            req.sanitize('nombre').escape().trim() + "', '" +
            req.sanitize('descripcion').escape().trim() + "', " +
            req.sanitize('precio').escape().trim() + ", '" +
            req.sanitize('tipo-item').escape().trim() + "');";
        
        req.getConnection(function(error, conn) {
            conn.query(sql_query, function(err, result) {
                if (err) {
                    res.json({resultado: err});
                    
                    res.render(
                        'item/register', {
                            id_item: id_item,
                            nombre: nombre,
                            descripcion: descripcion,
                            precio: precio,
                            tipo: tipo
                        }
                    );
                } else {                
                    res.json({resultado: "Item registrado"});

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
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })                
        res.json({resultado: error_msg});       
        
        res.render(
            'item/register', {
                id_item: id_item,
                nombre: nombre,
                descripcion: descripcion,
                precio: precio,
                tipo: tipo
            }
        );
    }
})

module.exports = app;