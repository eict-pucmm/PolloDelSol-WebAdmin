const express = require('express');
const axios   = require('axios');
const config = require('../../config');

let app = express();

const checkIfString = myString => {
    return (typeof myString === 'string' || myString instanceof String);
}

app.get('/', (req, res) => {
    
    if(req.session.loggedIn) {
        axios.get(`${config.server.url}/api/menu`)
        .then(result => {
            res.render('menu/gestionar', {
                menus: result.data.menus,
               
            });
        }).catch(err => console.log(err));
    }else {
        res.redirect('/login');
    }
    
});

app.post('/register', (req, res) => {

    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();

    let errors = req.validationErrors();

    if (!errors) {
        axios.post(`${config.server.url}/api/menu/register`, {name: req.sanitize('nombre').escape().trim(), plato_del_dia: 0})
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

    if (req.session.loggedIn) {
        axios.get(`${config.server.url}/api/item/get?activo=1`)
        .then(combos => {
            axios.get(`${config.server.url}/api/item/categories`)
            .then(result => {
                axios.get(`${config.server.url}/api/menu?id_menu=${req.params.id_menu}`)
                .then(menu => {
                    axios.get(`${config.server.url}/api/menu/items?id_menu=${req.params.id_menu}`)
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
    }else {
        res.redirect('/login')
    }
});

app.post('/edit/(:id_menu)', (req, res) => {

    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();

    let errors = req.validationErrors();

    if (!errors) {
        let data = {
            deleted: checkIfString(req.body['item-list']) ? [req.body['item-list']] : req.body['item-list'],
            inserted: checkIfString(req.body['menu-items']) ? [req.body['menu-items']] : req.body['menu-items'],
            menu: {nombre: req.body.nombre},
        }
    
        if (req.body.activar) {
            data.menu.activo = 1;
        } else if (req.body.desactivar) {
            data.menu.activo = 0;
        }

        axios.post(`${config.server.url}/api/menu/edit/${req.params.id_menu}`, data)
        .then(response => {
            req.flash('success', response.data.message)
        })
        .catch(err => console.log(err))
        .finally( () => {
            res.redirect(`/menu`);
        });
    } else {
        req.flash('error', errors[0].msg);
        res.redirect(`/menu/edit/${req.params.id_menu}`);
    }

});

module.exports = app;