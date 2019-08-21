const express = require('express');
const axios   = require('axios');
const url = require('../../config').server.url;

let app = express();

app.get('/', (req, res, next) => {
    
    if (req.session.loggedIn) {
        axios.get(`${url}/api/platodeldia/`)
        .then(result => {
            res.render('menu/platodeldia', {data: result.data.menu})
        })
        .catch(err => res.send(err))
    } else {
        res.redirect('/login');
    }
});

app.post('/register', (req, res) => {

    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();

    let errors = req.validationErrors();

    if (!errors) {
        axios.post(`${url}/api/menu/register`, {name: req.sanitize('nombre').escape().trim(), plato_del_dia: 1})
        .then( () => {
            req.flash('success', 'Menu registrado satisfactoriamente');
        }).catch(err => {
            req.flash('error', err);
        }).finally( () => {
            res.redirect('/platodeldia');
        });
    } else {
        req.flash('error', errors[0].msg);
        res.redirect('/platodeldia');
    }
});

app.get('/edit/(:id_menu)', function (req, res, next) {

    const id_menu = req.params.id_menu;
    axios.get(`${url}/api/platodeldia/edit/${id_menu}`)
        .then(result => {
            res.render('menu/editPlato', {data: result.data})
        }).catch(err => res.send(err))
});

app.post('/edit/(:id_menu)', (req, res, next) => {

    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();
    let errors = req.validationErrors();
    
    if (!errors) {
        let index, datos = {platos: []}

        datos.nombre = req.sanitize('nombre').escape().trim();
        datos.activo = req.body.activo !== undefined ? 1 : 0;
        
        for (index = 0; index < 7; index++) {
            datos.platos.push({
                id_menu: req.params.id_menu,
                dia: index + 1,
                id_arroz: req.body.arroz[index] == 'null' ? null : req.body.arroz[index],
                id_carne: req.body.carne[index] == 'null' ? null : req.body.carne[index],
                id_guarnicion: req.body.guarnicion[index] == 'null' ? null : req.body.guarnicion[index],
                id_ensalada: req.body.ensalada[index] == 'null' ? null : req.body.ensalada[index],
                id_habichuela: req.body.habichuela[index] == 'null' ? null : req.body.habichuela[index]
            });
        }
        
        axios.post(`${url}/api/platodeldia/edit/${req.params.id_menu}`, {data: datos})
        .then( response => {
            if (!response.data.error) {
                res.redirect(`/platodeldia`)
            } else {
                req.flash('error', response.data.message);
                res.redirect(`/platodeldia/edit/${req.params.id_menu}`);
            }
        }).catch(err => console.log(err));
    } else {
        req.flash('error', errors[0].msg);
        res.redirect(`/platodeldia/edit/${req.params.id_menu}`);
    }
});
module.exports = app;
