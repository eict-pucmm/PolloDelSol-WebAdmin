const express = require('express');
const axios = require('axios'); 

let app = express();

app.get('/', function (req, res, next) {
    axios.get('http://localhost:5000/api/empresa')
        .then(result => {
            res.render('empresa/list', {data: result.data.empresa})
        });
});

app.get('/edit/(:id_empresa)', function(req, res, next){
    axios.get(`http://localhost:5000/api/empresa?id_empresa=${req.params.id_empresa}`)
        .then(result => {
            console.log(result.data.empresa[0])
            if(result.data.empresa == null){
                req.flash('error', `No se encontro la empresa con Id = "${req.params.id_empresa}"`);
                res.redirect('empresa')
            }else{
                console.log(result.data.empresa[0])
                res.render('empresa/edit', {empresa: result.data.empresa[0]});
            }
        })
        .catch(err => console.log)
});

app.post('/edit/(:id_item)', function(req, res, next){
    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();
    req.assert('descripcion', 'La descripcion no puede estar vacía').notEmpty();
    req.assert('precio', 'El precio no puede estar vacío').notEmpty();

    let errors = req.validationErrors()
    let item = {id: '', nombre: '', descripcion: '', tipo: '', precio: '', eliminado: 0};
    
    if( !errors ) {
        
        item.id = req.sanitize('id-item').escape().trim();
        item.nombre = req.sanitize('nombre').escape().trim();
        item.descripcion = req.sanitize('descripcion').escape().trim();
        item.tipo = req.sanitize('tipo-item').escape().trim();
        item.precio = req.sanitize('precio').escape().trim();
        item.eliminado = req.body.eliminado;

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
                            action: 'Modificar', item
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
                action: 'Modificar', item
            }
        );
    }
});


module.exports = app;