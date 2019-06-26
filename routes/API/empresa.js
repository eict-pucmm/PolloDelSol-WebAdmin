const express = require('express');
let app = express();

app.get('/', function (req, res, next) {

    let sql_query = `SELECT empresa.id_empresa, cliente.nombre, empresa.RNC, cierre.tipo_de_cierre, cierre.dia_ajustado, empresa.registrada 
    FROM empresa, cliente, cierre, empresacierre 
    WHERE empresacierre.id_cierre = cierre.id_cierre AND empresacierre.id_empresa = empresa.id_empresa AND empresa.id_cliente = cliente.id_cliente;`;
    req.getConnection(function (error, conn) {
        conn.query(sql_query, function (err, rows, fields) {
            if (!err) {
                res.status(200).send({error: false, empresa: rows});
            } else {
                res.status(500).send({error: true, message: err});
            }
        });
    })
});

app.get('/edit/(:id_empresa)', function(req, res, next){
    req.getConnection(function(error, conn) {
        conn.query(`SELECT empresa.id_empresa, cliente.nombre, empresa.RNC, cierre.tipo_de_cierre, cierre.dia_de_cierre, empresa.registrada FROM empresa, cliente, cierre, empresacierre WHERE empresacierre.id_cierre = cierre.id_cierre AND empresacierre.id_empresa = empresa.id_empresa AND empresa.id_cliente = cliente.id_cliente AND empresa.id_empresa = '${req.params.id_empresa}';`, function(err, rows, fields) {
            if (rows.length <= 0) {
            
            }        
        });
    });
});
 
app.post('/edit/(:id_empresa)', function(req, res, next){
    req.assert('cierre', 'Debe seleccionar un tipo de cierre').notEmpty();
    req.assert('dia_cierre', 'El dia de cierre no puede estar vacio').notEmpty();

    

    let errors = req.validationErrors()
    let enterprise = {id: '', nombre: '', rnc: '', tipo_de_cierre: '', dia_de_cierre: '', registrada: '', deleted: ''};
    
    if( !errors ) {
        
        enterprise.id = req.sanitize('id-enterprise').escape().trim();
        enterprise.nombre = req.sanitize('nombre').escape().trim();
        enterprise.rnc = req.sanitize('rnc').escape().trim();
        enterprise.tipo_de_cierre = req.sanitize('tipo-de-cierre').escape().trim();
        enterprise.dia_de_cierre = req.sanitize('dia_de_cierre').escape().trim();
        enterprise.registrada = req.body.registrada;

        let sql_query = `BEGIN TRANSACTION;
            UPDATE empresa SET
            registrada = ${enterprise.registrada}, 
            WHERE id_empresa = '${enterprise.id}';
            UPDATE cierre SET
            tipo_de_cierre = '${enterprise.tipo_de_cierre}'
            dia_de_cierre = '${enterprise.dia_de_cierre}'
            WHERE id_cierre = (SELECT id_cierre FROM empresacierre WHERE id_empresa = '${enterpirse.id}');
            COMMIT;
            `

        
        req.getConnection(function(error, conn) {
            conn.query(sql_query, function(err, result) {
                if (err) {
                    req.flash('error', err);
                    res.render(
                        `empresa/edit/${enterprise.id}`, {
                            action: 'Modificar', item
                        }
                    );
                } else {
                    req.flash('success', 'Empresa modificada satisfactoriamente');
                    res.redirect('/empresa');
                }
            })
        })
    }
    else {
        req.flash('error', errors[0].msg);
        res.render(
            `item/edit/${enterprise.id}`, {
                action: 'Modificar', enterpirse
            }
        );
    }
});

module.exports = app;