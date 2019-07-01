const express = require('express');
let app = express();

app.get('/', function (req, res, next) {

    let sql_query = `SELECT empresa.id_empresa, cliente.nombre, empresa.RNC, cierre.tipo_de_cierre, DATE_FORMAT(cierre.dia_ajustado, "%d/%m/%Y") as dia_cierre, empresa.registrada 
    FROM empresa, cliente, cierre, empresacierre 
    WHERE empresacierre.id_cierre = cierre.id_cierre AND empresacierre.id_empresa = empresa.id_empresa AND empresa.id_cliente = cliente.id_cliente`;
    if (req.query.id_empresa) {
        sql_query += ` AND empresa.id_empresa = '${req.query.id_empresa}'`;
}
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

 
app.post('/edit/(:id_empresa)', (req, res) => {
    const id_empresa = req.params.id_item;
    const enterprise = req.body.data;
    console.log(enterprise);
    
    /*let sql_query = `BEGIN TRANSACTION;
        UPDATE empresa SET
        registrada = ${enterprise.registrada}, 
        WHERE id_empresa = '${enterprise.id}';
        UPDATE cierre SET
        tipo_de_cierre = '${enterprise.tipo_de_cierre}'
        dia_de_cierre = '${enterprise.dia_de_cierre}'
        WHERE id_cierre = (SELECT id_cierre FROM empresacierre WHERE id_empresa = '${enterprise.id}');
        COMMIT;
    `

    if (!item || !id_item) {
        res.status(400).send({error: true, message: 'Please provide an item and item id'});
    } else {
        req.getConnection((error, conn) => {
            if (!error) {
                conn.query(`UPDATE item SET ? WHERE id_item = ?`, [item, id_item], (err, results) => {
                    if (!err) {
                        res.status(200).send({error: false, result: results, message: 'Item modificado exitosamente'});
                    } else {
                        res.status(500).send({error: true, message: err});
                    }
                });
            } else {
                res.status(500).send({error: true, message: error});
            }
        });
    }*/
});


module.exports = app;