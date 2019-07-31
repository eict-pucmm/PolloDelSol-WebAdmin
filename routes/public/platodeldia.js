const express = require('express');
const axios   = require('axios');
const url = require('../../config').server.url;

let app = express();

app.get('/', (req, res, next) => {
    axios.get(`${url}/api/platodeldia`)
        .then(result => {
            return result.data;
        }).then(datos => {
                console.log(datos);
                res.render('menu/platodeldia', {data: datos})
        }).catch(err => res.send(err))
    
});

app.get('/edit/(:id_menu)', function (req, res, next) {
    const id_menu = req.params.id_menu;
    axios.get(`${url}/api/platodeldia/edit/${id_menu}`)
        .then(result => {
            return result.data;
        }).then(datos => {
                //console.log(datos);
                res.render('menu/editPlato', {data: datos})
        }).catch(err => res.send(err))
});

app.post('/edit/(:id_menu)', (req, res, next) => {
    const id_menu = req.params.id_menu;
    console.log(req.body.menu_activo);
    var menu_activo=0;
    if (req.body.menu_activo=="on"){
        menu_activo=1
    }
    console.log(menu_activo);
    arroz1 = req.sanitize('arroz1').escape().trim();
    arroz2 = req.sanitize('arroz2').escape().trim();
    arroz3 = req.sanitize('arroz3').escape().trim();
    arroz4 = req.sanitize('arroz4').escape().trim();
    arroz5 = req.sanitize('arroz5').escape().trim();
    arroz6 = req.sanitize('arroz6').escape().trim();
    arroz7 = req.sanitize('arroz7').escape().trim();
    carne1 = req.sanitize('carne1').escape().trim();
    carne2 = req.sanitize('carne2').escape().trim();
    carne3 = req.sanitize('carne3').escape().trim();
    carne4 = req.sanitize('carne4').escape().trim();
    carne5 = req.sanitize('carne5').escape().trim();
    carne6 = req.sanitize('carne6').escape().trim();
    carne7 = req.sanitize('carne7').escape().trim();
    guarnicion1 = req.sanitize('guarnicion1').escape().trim();
    guarnicion2 = req.sanitize('guarnicion2').escape().trim();
    guarnicion3 = req.sanitize('guarnicion3').escape().trim();
    guarnicion4 = req.sanitize('guarnicion4').escape().trim();
    guarnicion5 = req.sanitize('guarnicion5').escape().trim();
    guarnicion6 = req.sanitize('guarnicion6').escape().trim();
    guarnicion7 = req.sanitize('guarnicion7').escape().trim();
    ensalada1 = req.sanitize('ensalada1').escape().trim();
    ensalada2 = req.sanitize('ensalada2').escape().trim();
    ensalada3 = req.sanitize('ensalada3').escape().trim();
    ensalada4 = req.sanitize('ensalada4').escape().trim();
    ensalada5 = req.sanitize('ensalada5').escape().trim();
    ensalada6 = req.sanitize('ensalada6').escape().trim();
    ensalada7 = req.sanitize('ensalada7').escape().trim();
    axios.get(`${url}/api/platodeldia/edit/${id_menu}`)
    .then(result => {
        return result.data;
    }).then(data => {
            //console.log(datos);
            let datosUpdate = {
                activo: menu_activo,
                plato:  [
                    {
                        id_plato_del_dia: data.plato[0].id_plato_del_dia,
                        dia: 1,
                        id_arroz: arroz1,
                        id_carne: carne1,
                        id_guarnicion: guarnicion1,
                        id_ensalada: ensalada1
                    },
                    {
                        id_plato_del_dia: data.plato[1].id_plato_del_dia,
                        dia: 2,
                        id_arroz: arroz2,
                        id_carne: carne2,
                        id_guarnicion: guarnicion2,
                        id_ensalada: ensalada2
                    },
                    {
                        id_plato_del_dia: data.plato[2].id_plato_del_dia,
                        dia: 3,
                        id_arroz: arroz3,
                        id_carne: carne3,
                        id_guarnicion: guarnicion3,
                        id_ensalada: ensalada3
                    },
                    {
                        id_plato_del_dia: data.plato[3].id_plato_del_dia,
                        dia: 4,
                        id_arroz: arroz4,
                        id_carne: carne4,
                        id_guarnicion: guarnicion4,
                        id_ensalada: ensalada4
                    },
                    {
                        id_plato_del_dia: data.plato[4].id_plato_del_dia,
                        dia: 5,
                        id_arroz: arroz5,
                        id_carne: carne5,
                        id_guarnicion: guarnicion5,
                        id_ensalada: ensalada5
                    },
                    {
                        id_plato_del_dia: data.plato[5].id_plato_del_dia,
                        dia: 6,
                        id_arroz: arroz6,
                        id_carne: carne6,
                        id_guarnicion: guarnicion6,
                        id_ensalada: ensalada6
                    },
                    {
                        id_plato_del_dia: data.plato[6].id_plato_del_dia,
                        dia: 7,
                        id_arroz: arroz7,
                        id_carne: carne7,
                        id_guarnicion: guarnicion7,
                        id_ensalada: ensalada7
                    },
                ]
            }
            console.log(datosUpdate);
            axios.post(`${url}/api/platodeldia/edit/${id_menu}`, {data: datosUpdate})
            .then( response => {
                if (!response.data.error) {
                    res.redirect(`/platodeldia`)
                } else {
                    req.flash('error', response.data.message);
                    res.redirect(`/platodeldia/edit/${id_menu}`);
                }
            }).catch(err => console.log(err));
            
    }).catch(err => res.send(err))
    
});
module.exports = app;
