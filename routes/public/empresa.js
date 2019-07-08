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

app.post('/edit/(:id_empresa)', (req, res, next) => {
    req.assert('nombre', 'El nombre no puede estar vacío').notEmpty();
    req.assert('RNC', 'el RNC no puede estar vacía').notEmpty();
    req.assert('id', 'El id no puede estar vacío').notEmpty();
    req.assert('dia_de_corte', 'El dia de cierre no pueden estar vacío').notEmpty();
    let fecha = new Date();
    let errors = req.validationErrors()
    let dia_corte = req.sanitize('dia_de_corte').escape().trim();
    let mes = fecha.getMonth() +1;
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
        nombre: req.sanitize('nombre').escape().trim(),
        rnc: req.sanitize('rnc').escape().trim(),
        tipo_de_cierre: parseInt(req.sanitize('tipo-de-corte').escape().trim()),
        dia_de_corte: anio.toString()+"-"+"0"+mes.toString()+"-"+dia_corte.toString(),
        registrada: req.body.registrada
    }
    axios.post(`http://127.0.0.1:5000/api/empresa/edit/${empresa.id_empresa}`, {data: empresa})
    .then(response => {
        req.flash('success', response.data.message);
    }).catch(err => console.log(err))
    .finally( () => {
        res.redirect(`/empresa`);
    });
});

module.exports = app;