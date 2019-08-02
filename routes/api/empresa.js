const express = require('express');
let app = express();

app.get('/', (req, res, next) => {

    let sql_query = `SELECT cliente.id_cliente, cliente.nombre, cliente.correo_electronico, cliente.telefono, empresa.id_empresa, empresa.rnc, empresa.aprobada, empresa.eliminado, cierre.dia_ajustado AS dia_de_cierre, cierre.tipo_de_cierre, COUNT(empresausuario.id_empresa) AS cant_empleados
        FROM cliente, empresa, cierre, empresacierre, empresausuario
        WHERE cliente.id_cliente = empresa.id_cliente
            AND empresacierre.id_empresa = empresa.id_empresa
            AND empresacierre.id_cierre = cierre.id_cierre
            AND empresausuario.id_empresa = empresa.id_empresa`;
    
    sql_query += req.query.id_empresa ? ` AND empresa.id_empresa = '${req.query.id_empresa}'` : ``;

    sql_query += ` GROUP BY cliente.nombre`;

    req.getConnection((error, conn) => {
        if (!error) {
            conn.query(sql_query, function (err, rows, fields) {
                if (!err) {
                    res.status(200).send({error: false, empresa: rows});
                } else {
                    res.status(500).send({error: true, message: err});
                }
            });
        } else {
            res.status(500).send({error: true, message: error});
        }
    })
});

 
app.post('/edit/(:id_empresa)', (req, res) => {
    const id_empresa = req.params.id_empresa;
    const empresa = req.body.empresa;
    const cierre = req.body.cierre;
    let sql_query, sql_query2 = '';
    
    if (req.body.actualizar_cierre) {
        sql_query = `UPDATE cierre SET ? WHERE id_cierre = (SELECT id_cierre FROM empresacierre WHERE id_empresa = '${id_empresa}');`;
    } else {
        sql_query = `INSERT INTO cierre SET ?`;
        sql_query2 = `INSERT INTO empresacierre VALUES (SELECT id_cierre FROM cierre WHERE tipo_de_cierre = ${cierre.tipo_de_cierre} AND dia_de_cierre = ${cierre.dia_de_cierre}, '${id_empresa}')`;
    }
 
    if (!empresa || !id_empresa) {
        res.status(400).send({error: true, message: 'Please provide an enterprise and enterprise id'});
    } else {
        req.getConnection((error, conn) => {
            if (!error) {
                conn.query(`UPDATE empresa SET ? WHERE id_empresa = ?`, [empresa, id_empresa], (err1, res1) => {
                    if (!err1) {
                        conn.query(sql_query, cierre, (err2, res2) => {
                            if(!err2){
                                if (sql_query2 != '') {
                                    conn.query(sql_query2, (err2, res2) => {});
                                }
                                res.status(200).send({error: false, message: 'Empresa modificada exitosamente'});
                            }
                        });
                    }
                });
            } else {
                res.status(500).send({error: true, message: error});
            }
        });
    }
});

module.exports = app;