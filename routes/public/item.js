const express = require('express');
const axios = require('axios');
const url = require('../../config').server.url;
let app = express();

app.get('/', (req, res, next) => {

    axios.get(`${url}/api/item/get`)
        .then(result => {
            return result.data.items;
        }).then(items => {
            axios.get(`${url}/api/item/categories`)
            .then(result => {
                return {data: items, categorias: result.data.categorias, subcategorias: result.data.subcategorias};
            }).then(datos => {
                res.render('item/list', datos)
            })
            .catch(err => res.send(err))
        }).catch(err => res.send(err));

});

app.get('/register', function (req, res, next) {

    let item = {
        id: '',
        nombre: '',
        descripcion: '',
        categoria: '',
        subcategoria: '',
        precio: '',
        puntos: '',
        eliminado: 0
    }

    axios.get(`${url}/api/item/get?subcategoria=Guarnicion`)
        .then(result => {
            return result;
        }).then(guarniciones => {
            axios.get(`${url}/api/item/get?subcategoria=Bebida`)
                .then(bebidas => {
                    axios.get(`${url}/api/item/categories`)
                    .then(result => {
                        return {
                            action: 'Registrar', 
                            item: item, 
                            categorias: result.data.categorias, 
                            subcategorias: result.data.subcategorias,
                            guarniciones: guarniciones.data.items,
                            bebidas: bebidas.data.items
                        };
                    }).then(datos => {
                        res.render('item/register', datos)
                    })
                    .catch(err => res.send(err))
                }).catch(err => res.send(err))
        }).catch(err => res.send(err));
});

app.post('/register', (req, res, next) => {

    req.assert('id-item', 'El Id no puede estar vacío').notEmpty();
    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();
    req.assert('descripcion', 'La descripcion no puede estar vacía').notEmpty();
    req.assert('precio', 'El precio no puede estar vacío').notEmpty();
    req.assert('puntos', 'Los puntos no pueden estar vacíos').notEmpty();

    let errors = req.validationErrors()
    let item = {
        id_item: req.sanitize('id-item').escape().trim(),
        nombre: req.sanitize('nombre').escape().trim(),
        descripcion: req.sanitize('descripcion').escape().trim(),
        id_categoria: parseInt(req.sanitize('categoria-cbx').escape().trim()),
        id_subcategoria: parseInt(req.sanitize('subcategoria-cbx').escape().trim()),
        precio: req.sanitize('precio').escape().trim(),
        puntos: req.sanitize('puntos').escape().trim(),
        eliminado: 0
    }

    if (!errors) {
        axios.post(`${url}/api/item/register`, {data: item})
        .then( () => {
            req.flash('success', 'Item registrado satisfactoriamente');
        }).catch(err => {
            req.flash('error', err);
        }).finally( () => {
            res.redirect('/item/register');
        });
    } else {
        req.flash('error', errors[0].msg);
        res.redirect('/item/register');
    }
});

app.get('/edit/(:id_item)', (req, res, next) => {

    let item;

    axios.get(`${url}/api/item/get?id_item=${req.params.id_item}`)
        .then(result => {
            item = result.data.items[0];
        }).catch(err => console.log(err));

    axios.get(`${url}/api/item/get?subcategoria=Guarnicion`)
        .then(result => {
            return result;
        }).then(guarniciones => {
            axios.get(`${url}/api/item/get?subcategoria=Bebida`)
                .then(bebidas => {
                    axios.get(`${url}/api/item/categories`)
                    .then(result => {
                        return {
                            action: 'Modificar', 
                            item: item, 
                            categorias: result.data.categorias, 
                            subcategorias: result.data.subcategorias,
                            guarniciones: guarniciones.data.items,
                            bebidas: bebidas.data.items
                        };
                    }).then(datos => {
                        res.render('item/register', datos)
                    })
                    .catch(err => res.send(err))
                }).catch(err => res.send(err))
        }).catch(err => res.send(err));
});

app.post('/edit/(:id_item)', (req, res, next) => {
    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();
    req.assert('descripcion', 'La descripcion no puede estar vacía').notEmpty();
    req.assert('precio', 'El precio no puede estar vacío').notEmpty();
    req.assert('puntos', 'Los puntos no pueden estar vacío').notEmpty();

    let errors = req.validationErrors()
    let item = {
        id_item: req.params.id_item,
        nombre: req.sanitize('nombre').escape().trim(),
        descripcion: req.sanitize('descripcion').escape().trim(),
        id_categoria: parseInt(req.sanitize('categoria-cbx').escape().trim()),
        id_subcategoria: parseInt(req.sanitize('subcategoria-cbx').escape().trim()),
        precio: req.sanitize('precio').escape().trim(),
        puntos: req.sanitize('puntos').escape().trim(),
        eliminado: req.body.eliminado
    }

    if (!errors) {
        axios.post(`${url}/api/item/edit/${item.id_item}`, {data: item})
        .then( response => {
            if (!response.data.error) {
                req.flash('success', response.data.message);
                res.redirect('/item');
            } else {
                req.flash('error', response.data.message);
                res.redirect(`/item/edit/${item.id_item}`);
            }
        }).catch(err => console.log(err));
    }
});

app.post('/delete/(:id_item)', (req, res, next) => {

    axios.post(`${url}/api/item/delete/${req.params.id_item}`)
    .then(response => {
        req.flash('success', response.data.message);
    }).catch(err => console.log(err))
    .finally( () => {
        res.redirect(`/item/edit/${req.params.id_item}`);
    });
});

module.exports = app;