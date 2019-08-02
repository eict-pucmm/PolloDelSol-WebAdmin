const express = require('express');
const axios = require('axios'); 
const config = require('../../config');

let app = express();

const dias = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

const parseDiaDeCierre = (dia_de_cierre, tipo_cierre, action) => {
    let date, dateStr;
    
    if (action === 'get') {
        if (tipo_cierre == 'Semanal') {
            date = new Date(dia_de_cierre.substring(0, 4), parseInt(dia_de_cierre.substring(5, 7)) - 1, dia_de_cierre.substring(8, 10));
            dateStr = dias[date.getDay()];
        } else {
            dateStr = `${dia_de_cierre.substring(8, 10)}-${dia_de_cierre.substring(5, 7)}-${dia_de_cierre.substring(0, 4)}`
        }
    } else if (action === 'post') {
        if (dias.includes(dia_de_cierre)) {
            let i = 0;
            date = new Date();
            while(i < 7 && (dias[date.getDay()] != dia_de_cierre)) {
                if (dias[date.getDay()] == dia_de_cierre) {
                    break;
                } else {
                    date.setDate(date.getDate() + 1);
                }
                i++;
            }
            dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        } else {
            dateStr = `${dia_de_cierre.substring(6, 10)}-${dia_de_cierre.substring(3, 5)}-${dia_de_cierre.substring(0, 2)}`
        }
    }
    return dateStr;
}

app.get('/', function (req, res, next) {
    if(config.loggedIn){
        axios.get(`${config.values.server.url}/api/empresa`)
        .then(result => {
            res.render('empresa/list', {data: result.data.empresa})
        });
    }else {
        res.redirect('/login')
    }
    
});

app.get('/edit/(:id_empresa)', (req, res, next) => {
    axios.get(`${config.values.server.url}/api/empresa?id_empresa=${req.params.id_empresa}`)
        .then(result => {
            if(result.data.empresa == null){
                req.flash('error', `No se encontro la empresa con Id = "${req.params.id_empresa}"`);
                res.redirect('/empresa')
            }else{
                let data = result.data.empresa[0];
                data.dia_de_cierre = parseDiaDeCierre(data.dia_de_cierre, data.tipo_de_cierre, 'get');
                res.render('empresa/edit', {empresa: data});
            }
        })
        .catch(err => console.log(err))
});

app.post('/edit/(:id_empresa)', (req, res, next) => {

    let data = { cierre: {}};

    data.cierre.tipo_de_cierre = req.sanitize('tipo-de-cierre').escape().trim();

    data.cierre.dia_de_cierre = parseDiaDeCierre(data.cierre.tipo_de_cierre == 'Semanal' ? req.sanitize('dia-de-cierre-week').escape().trim() : req.sanitize('dia-de-cierre').escape().trim(), data.cierre.tipo_de_cierre, 'post')
    data.actualizar_cierre = true;

    data.empresa = {
        aprobada: req.body.aprobada ? 1 : 0
    }

    axios.post(`${config.values.server.url}/api/empresa/edit/${req.params.id_empresa}`, data)
    .then(response => {
        req.flash('success', response.data.message);
    }).catch(err => console.log(err))
    .finally( () => {
        res.redirect(`/empresa`);
    });
});

module.exports = app;