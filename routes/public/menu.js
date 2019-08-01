const express = require('express');
const axios   = require('axios');
const url = require('../../config').server.url;

let app = express();

const checkIfString = myString => {
    return (typeof myString === 'string' || myString instanceof String);
}

app.get('/', (req, res) => {
    axios.get(`${url}/api/menu`)
        .then(result => {
            res.render('menu/gestionar', {
                menus: result.data.menus
            });
        }).catch(err => console.log(err));
});

app.post('/register', (req, res) => {

    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();

    let errors = req.validationErrors();

    if (!errors) {
        axios.post(`${url}/api/menu/register`, {name: req.body.nombre, plato_de_dia: 0})
        .then( () => {
            req.flash('success', 'Menu registrado satisfactoriamente');
        }).catch(err => {
            req.flash('error', err);
        }).finally( () => {
            res.redirect('/menu');
        });
    } else {
        req.flash('error', errors[0].msg);
        res.redirect('/menu');
    }
});

app.get('/edit/(:id_menu)', (req, res) => {

    axios.get(`${url}/api/item/get?eliminado=0`)
        .then(combos => {
            axios.get(`${url}/api/item/categories`)
            .then(result => {
                axios.get(`${url}/api/menu?id_menu=${req.params.id_menu}`)
                .then(menu => {
                    axios.get(`${url}/api/menu/items?id_menu=${req.params.id_menu}`)
                        .then(menu_items => {
                            res.render('menu/edit', {
                                categorias: result.data.categorias,
                                subcategorias: result.data.subcategorias,
                                menu: menu.data.menus[0],
                                items: combos.data.items,
                                menuItems: menu_items.data.menu_items
                            });
                        }).catch(err => console.log(err));
                }).catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        }).catch(err => console.log(err));

});

app.post('/edit/(:id_menu)', (req, res) => {

    const data = {
        deleted: checkIfString(req.body['item-list']) ? [req.body['item-list']] : req.body['item-list'],
        inserted: checkIfString(req.body['menu-items']) ? [req.body['menu-items']] : req.body['menu-items'],
        nombre: req.body.nombre,
        activo: req.body.activo !== undefined ? 1 : 0
    }
    
    axios.post(`${url}/api/menu/edit/${req.params.id_menu}`, data)
        .then(response => {
            req.flash('success', response.data.message)
        })
        .catch(err => console.log(err))
        .finally( () => {
            res.redirect(`/menu`);
        });

});

module.exports = app;