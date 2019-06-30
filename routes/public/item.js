const express = require('express');
const axios   = require('axios');
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
const config = require('../../config');

let app = express();
cloudinary.config(config.cloudinary);

const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'item',
    allowedFormats: ['jpg', 'png'],
    transformation: [{ height: 500, crop: 'limit' }]}
);

const parser = multer({ storage: storage });

app.get('/', (req, res, next) => {

    axios.get(`${config.server.url}/api/item/get`)
        .then(result => {
            return result.data.items;
        }).then(items => {
            axios.get(`${config.server.url}/api/item/categories`)
            .then(result => {
                return {data: items, categorias: result.data.categorias, subcategorias: result.data.subcategorias};
            }).then(datos => {
                res.render('item/list', datos)
            })
            .catch(err => res.send(err))
        }).catch(err => res.send(err));

});

app.get('/register', (req, res, next) => {

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

    axios.get(`${config.server.url}/api/item/get?subcategoria=Guarnicion`)
        .then(result => {
            return result;
        }).then(guarniciones => {
            axios.get(`${config.server.url}/api/item/get?subcategoria=Bebida`)
                .then(bebidas => {
                    axios.get(`${config.server.url}/api/item/categories`)
                    .then(result => {
                        return {
                            action: 'Registrar', 
                            item: item, 
                            categorias: result.data.categorias, 
                            subcategorias: result.data.subcategorias,
                            guarniciones: guarniciones.data.items,
                            bebidas: bebidas.data.items,
                            combo: undefined,
                            itemCombo: undefined
                        };
                    }).then(datos => {
                        res.render('item/register', datos)
                    })
                    .catch(err => res.send(err))
                }).catch(err => res.send(err))
        }).catch(err => res.send(err));
});

app.post('/register', parser.single('image'), (req, res, next) => {

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
        eliminado: 0,
        imagen: ''
    }

    if (!errors) {
        axios.post(`${config.server.url}/api/item/register`, {data: item})
        .then( () => {
            req.flash('success', 'Item registrado satisfactoriamente');
        }).then( () => {
            if (req.body['selected-category'] == 'Combo') {
                let itemCombo = [], combo = {};
                combo = {id_combo: item.id_item, max_guarnicion: parseInt(req.body['max-guarnicion']), max_bebida: parseInt(req.body['max-bebida'])}
                req.body.bebidas.forEach(bebida => {
                    itemCombo.push({id_combo: item.id_item, id_item: bebida})
                })
                req.body.guarniciones.forEach(guarnicion => {
                    itemCombo.push({id_combo: item.id_item, id_item: guarnicion})
                })

                axios.post(`${config.server.url}/api/item/register/combo`, {combo: combo, itemCombo: itemCombo})
                    .then(result => {})
                    .catch(err => console.log(err));
            }
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

    let item, combo = '', itemCombo = '';

    axios.get(`${config.server.url}/api/item/get?id_item=${req.params.id_item}`)
        .then(result => {
            item = result.data.items[0];
            if (result.data.items[0].categoria == 'Combo') {
                axios.get(`${config.server.url}/api/item/get/combo?id_combo=${result.data.items[0].id_item}`)
                    .then(comboData => {
                        combo = comboData.data.combo[0];
                        itemCombo = comboData.data.itemCombo;
                    })
            }
        }).catch(err => console.log(err));

    axios.get(`${config.server.url}/api/item/get?subcategoria=Guarnicion`)
        .then(result => {
            return result;
        }).then(guarniciones => {
            axios.get(`${config.server.url}/api/item/get?subcategoria=Bebida`)
                .then(bebidas => {
                    axios.get(`${config.server.url}/api/item/categories`)
                    .then(result => {
                        return {
                            action: 'Modificar', 
                            item: item, 
                            categorias: result.data.categorias, 
                            subcategorias: result.data.subcategorias,
                            guarniciones: guarniciones.data.items,
                            bebidas: bebidas.data.items,
                            combo: combo,
                            itemCombo: itemCombo
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
        eliminado: req.body.eliminado,
        imagen: req.body.imagen
    }

    if (!errors) {
        axios.post(`${config.server.url}/api/item/edit/${item.id_item}`, {data: item})
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

    axios.post(`${config.server.url}/api/item/delete/${req.params.id_item}`)
    .then(response => {
        req.flash('success', response.data.message);
    }).catch(err => console.log(err))
    .finally( () => {
        res.redirect(`/item/edit/${req.params.id_item}`);
    });
});

module.exports = app;