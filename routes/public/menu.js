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

    axios.get(`${url}/api/item/get?categoria=Combo`)
        .then(combos => {
            axios.get(`${url}/api/menu?id_menu=${req.params.id_menu}`)
            .then(menu => {
                axios.get(`${url}/api/menu/items/${req.params.id_menu}`)
                    .then(menu_items => {
                        res.render('menu/edit', {
                            menu: menu.data.menus[0],
                            combos: combos.data.items,
                            menuItems: menu_items.data.menu_items
                        });
                    }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));

});

app.post('/edit/(:id_menu)', (req, res) => {

    let deleted, inserted;

    deleted = checkIfString(req.body['combo-items']) ? [req.body['combo-items']] : req.body['combo-items'];
    inserted = checkIfString(req.body['menu-items']) ? [req.body['menu-items']] : req.body['menu-items'];
    
    axios.post(`${url}/api/menu/edit/${req.params.id_menu}`, {deleted: deleted, inserted: inserted})
        .catch(err => console.log(err));

    res.redirect('/menu');

});

app.post('/delete/(:id_menu)', (req, res, next) => {

    const action = req.body.activo == 0 ? 1 : 0;

    axios.post(`${url}/api/menu/delete/${req.params.id_menu}/${action}`)
    .then(response => {
        req.flash('success', response.data.message);
    }).catch(err => console.log(err))
    .finally( () => {
        res.redirect(`/menu/edit/${req.params.id_menu}`);
    });
});

module.exports = app;