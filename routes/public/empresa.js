const express = require('express');
const axios = require('axios'); 
const url = require('../../config').server.url;

let app = express();

app.get('/', function (req, res, next) {
    axios.get(`${url}/api/empresa`)
        .then(result => {
            res.render('empresa/list', {data: result.data.empresa})
        });
});

app.get('/edit/(:id_empresa)', function(req, res, next){
    axios.get(`${url}/api/empresa?id_empresa=${req.params.id_empresa}`)
        .then(result => {
            if(result.data.empresa == null){
                req.flash('error', `No se encontro la empresa con Id = "${req.params.id_empresa}"`);
                res.redirect('empresa')
            }else{
                res.render('empresa/edit', {empresa: result.data.empresa[0]});
            }
        })
        .catch(err => console.log(err))
});

app.post('/edit/(:id_empresa)', (req, res, next) => {

    console.log(req.body)

    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();
    req.assert('rnc', 'El RNC no puede estar vacío').notEmpty();
    req.assert('dia_de_corte', 'El dia de cierre no pueden estar vacío').notEmpty();

    let fecha = new Date();
    let errors = req.validationErrors()
    let dia_corte = req.sanitize('dia_de_corte').escape().trim();
    let mes = fecha.getMonth() + 1;
    let dia = fecha.getDate();
    let anio = fecha.getFullYear();
    if (dia >= dia_corte) {
        if (mes==12) {
            mes = 1;
            anio++;
        }else{
            mes++;
        }
    }
    
    
    let empresa = {
        id_empresa: req.params.id_empresa,
        nombre: req.params.nombre,
        rnc: req.params.rnc,
        tipo_de_cierre: parseInt(req.sanitize('tipo-de-corte').escape().trim()),
        dia_de_corte: req.sanitize('dia_de_corte').escape().trim(),
        registrada: req.body.registrada
    }
    
    axios.post(`${url}/api/empresa/edit/${empresa.id_empresa}`, {data: empresa})
    .then(response => {
        req.flash('success', response.data.message);
    }).catch(err => console.log(err))
    .finally( () => {
        res.redirect(`/empresa`);
    });
});

module.exports = app;