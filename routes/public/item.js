const express = require('express');
const axios   = require('axios');
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
const config = require('../../config');

let app = express();
let regItem;

cloudinary.config(config.values.cloudinary);

const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'item',
    allowedFormats: ['jpg', 'png'],
    transformation: [{ height: 500, crop: 'limit' }]}
);

const parser = multer({ storage: storage });

app.get('/', (req, res, next) => {

    if(config.loggedIn){
        axios.get(`${config.values.server.url}/api/item/get`)
        .then(result => {
            return result.data.items;
        }).then(items => {
            axios.get(`${config.values.server.url}/api/item/categories`)
            .then(result => {
                return {data: items, categorias: result.data.categorias, subcategorias: result.data.subcategorias};
            }).then(datos => {
                res.render('item/list', datos)
            })
            .catch(err => res.send(err))
        }).catch(err => res.send(err));
    }else {
        res.redirect('/login')
    }

    

});

app.get('/register', (req, res, next) => {

    let item;
    if (regItem) {
        item = regItem;
    } else {
        item = {
            id: '',
            nombre: '',
            descripcion: '',
            categoria: '',
            subcategoria: '',
            precio: '',
            eliminado: 0
        }
    }
    if(config.loggedIn){
        axios.get(`${config.values.server.url}/api/item/get?categoria=Individual&subcategoria=Guarnicion&eliminado=0`)
        .then(result => {
            return result;
        }).then(guarniciones => {
            axios.get(`${config.values.server.url}/api/item/get?subcategoria=Bebida&eliminado=0`)
                .then(result2 => {
                    return result2;
                })
                .then(bebidas => {
                    axios.get(`${config.values.server.url}/api/item/categories`)
                    .then(result => {
                        return {
                            action: 'Registrar item', 
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
                })
                .catch(err => res.send(err))
        }).catch(err => res.send(err));
    }else {
        res.redirect('/login')
    }

    
});

app.post('/register', parser.single('image'), (req, res, next) => {

    req.assert('id-item', 'El Id no puede estar vacío').notEmpty();
    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();
    req.assert('descripcion', 'La descripcion no puede estar vacía').notEmpty();
    req.assert('precio', 'El precio no puede estar vacío').notEmpty();

    if (req.body['selected-category'] == 'Combo') {
        req.assert('bebidas', 'Debe seleccionar al menos una opcion de bebida').notEmpty();
        req.assert('guarniciones', 'Debe seleccionar al menos una opcion de guarnición').notEmpty();
    }

    let errors = req.validationErrors();
    let item = {
        id_item: req.sanitize('id-item').escape().trim(),
        nombre: req.sanitize('nombre').escape().trim(),
        descripcion: req.sanitize('descripcion').escape().trim(),
        id_categoria: parseInt(req.sanitize('categoria-cbx').escape().trim()),
        id_subcategoria: parseInt(req.sanitize('subcategoria-cbx').escape().trim()),
        precio: req.sanitize('precio').escape().trim(),
        eliminado: 0,
        imagen: req.file.url
    }
    regItem = Object.assign({}, item);
    regItem.categoria = req.body['selected-category'];

    if (!errors) {
        axios.post(`${config.values.server.url}/api/item/register`, {data: item})
        .then( () => {
            req.flash('success', 'Item registrado satisfactoriamente');
        }).then( () => {
            if (req.body['selected-category'] == 'Combo') {
                let itemCombo = [], combo = {};
                combo = {id_combo: item.id_item, max_guarnicion: parseInt(req.body['max-guarnicion']), max_bebida: parseInt(req.body['max-bebida'])}
                if (Array.isArray(req.body.bebidas)) {
                    req.body.bebidas.forEach(bebida => {
                        itemCombo.push({id_combo: item.id_item, id_item: bebida})
                    });
                } else {
                    itemCombo.push({id_combo: item.id_item, id_item: req.body.bebidas});
                }

                if (Array.isArray(req.body.guarniciones)) {
                    req.body.guarniciones.forEach(guarnicion => {
                        itemCombo.push({id_combo: item.id_item, id_item: guarnicion})
                    });
                } else {
                    itemCombo.push({id_combo: item.id_item, id_item: req.body.guarniciones});
                }

                axios.post(`${config.values.server.url}/api/item/register/combo`, {combo: combo, itemCombo: itemCombo})
                    .then(result => {})
                    .catch(err => console.log(err));
            }
        }).catch(err => {
            console.log(err);
        }).finally( () => {
            regItem = undefined;
            res.redirect('/item/register');
        });
    } else {
        req.flash('error', errors[0].msg);
        res.redirect('/item/register');
    }
});

app.get('/edit/(:id_item)', (req, res, next) => {

    let item, combo = '', itemCombo = '';

    if(config.loggedIn) {
        axios.get(`${config.values.server.url}/api/item/get?id_item=${req.params.id_item}`)
        .then(result => {
            item = result.data.items[0];
            if (result.data.items[0].categoria == 'Combo') {
                axios.get(`${config.values.server.url}/api/item/get/combo?id_combo=${result.data.items[0].id_item}`)
                    .then(comboData => {
                        combo = comboData.data.combo[0];
                        itemCombo = comboData.data.itemCombo;
                    })
            }
        }).catch(err => console.log(err));

    axios.get(`${config.values.server.url}/api/item/get?subcategoria=Guarnicion`)
        .then(result => {
            return result;
        }).then(guarniciones => {
            axios.get(`${config.values.server.url}/api/item/get?subcategoria=Bebida`)
                .then(bebidas => {
                    axios.get(`${config.values.server.url}/api/item/categories`)
                    .then(result => {
                        return {
                            action: 'Modificar item', 
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
    }else {
        res.redirect('/login')
    }

    
});

app.post('/edit/(:id_item)', parser.single('image'), (req, res, next) => {

    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();
    req.assert('descripcion', 'La descripcion no puede estar vacía').notEmpty();
    req.assert('precio', 'El precio no puede estar vacío').notEmpty();

    let updateCombo = false, itemCombo, comboData;
    let errors = req.validationErrors()
    let item = {
        id_item: req.params.id_item,
        nombre: req.sanitize('nombre').escape().trim(),
        descripcion: req.sanitize('descripcion').escape().trim(),
        id_categoria: parseInt(req.sanitize('categoria-cbx').escape().trim()),
        id_subcategoria: parseInt(req.sanitize('subcategoria-cbx').escape().trim()),
        precio: req.sanitize('precio').escape().trim(),
        eliminado: req.body.eliminado !== undefined ? 0 : 1,
    }

    if (req.body['selected-category'] == 'Combo') {
        updateCombo = true;
        itemCombo = [];
        comboData = {id_combo: item.id_item, max_guarnicion: parseInt(req.body['max-guarnicion']), max_bebida: parseInt(req.body['max-bebida'])}
        if (Array.isArray(req.body.bebidas)) {
            req.body.bebidas.forEach(bebida => {
                itemCombo.push({id_combo: item.id_item, id_item: bebida})
            });
        } else {
            itemCombo.push({id_combo: item.id_item, id_item: req.body.bebidas});
        }
        if (Array.isArray(req.body.guarniciones)) {
            req.body.guarniciones.forEach(guarnicion => {
                itemCombo.push({id_combo: item.id_item, id_item: guarnicion})
            });
        } else {
            itemCombo.push({id_combo: item.id_item, id_item: req.body.guarniciones});
        }
    }

    item.imagen = req.file ? req.file.url : req.body.imagen;

    if (!errors) {
        axios.post(`${config.values.server.url}/api/item/edit/${item.id_item}`, {data: item})
        .then( response => {
            if (!response.data.error) {
                req.flash('success', response.data.message);
                if (updateCombo) {
                    axios.post(`${config.server.url}/api/item/combo/edit`, {combo: comboData, itemCombo: itemCombo})
                    .then(comboRes => {console.log(comboRes)})
                    .catch(err => console.log(err));
                }
            } else {
                req.flash('error', response.data.message);
                res.redirect(`/item/edit/${item.id_item}`);
            }
        }).catch(err => console.log(err))
        .finally( () => {
            res.redirect('/item');
        });
    } else {
        req.flash('error', errors[0].msg);
        res.redirect(`/item/edit/${item.id_item}`);
    }
});

module.exports = app;