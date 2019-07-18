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

    let errors = req.validationErrors()
    let empresa = {
        id_empresa: req.params.id_empresa,
        nombre: req.sanitize('nombre').escape().trim(),
        rnc: req.sanitize('rnc').escape().trim(),
        tipo_de_corte: parseInt(req.sanitize('tipo-de-corte').escape().trim()) + 1  ,
        dia_de_corte: req.sanitize('dia_de_corte').escape().trim(),
        eliminado: req.body.eliminado
    }
    axios.post(`http://127.0.0.1:5000/api/empresa/edit/${empresa.id_empresa}`, {data: empresa})
    console.log(empresa)
});

module.exports = app;