const express = require('express');
const {poolPromise} = require('../../db')
let app = express();
const config = require('../../config');
const sql = require('mssql')


app.get('/', async (req, res, next) => {
    //Vainita SQL SERVER
    try {
        const pool = await poolPromise
        const result = await pool.request()
            .query(`select 
            cliente.id_cliente, 
            cliente.nombre, 
            cliente.correo_electronico, 
            cliente.telefono, 
            empresa.id_empresa, 
            empresa.rnc, 
            empresa.aprobada, 
            empresa.eliminado, 
            cierre.dia_ajustado dia_de_cierre, 
            cierre.tipo_de_cierre, 
            count(empresausuario.id_empresa) cant_empleados
        from 
            cliente, 
            empresa, 
            cierre, 
            empresacierre, 
            empresausuario
        where 
            cliente.id_cliente = empresa.id_cliente
            and empresacierre.id_empresa = empresa.id_empresa
            and empresacierre.id_cierre = cierre.id_cierre
            and empresausuario.id_empresa = empresa.id_empresa
        group by
            cliente.id_cliente, 
            cliente.nombre, 
            cliente.correo_electronico, 
            cliente.telefono, 
            empresa.id_empresa, 
            empresa.rnc, 
            empresa.aprobada, 
            empresa.eliminado, 
            cierre.dia_ajustado, 
            cierre.tipo_de_cierre;`)      
    
        res.status(200).send({error: false, empresa: result.recordset});
    } catch (err) {
        res.status(500).send({error: true, message: err});
    } 



    //Vainita MySQL
    /*let sql_query = `SELECT cliente.id_cliente, cliente.nombre, cliente.correo_electronico, cliente.telefono, empresa.id_empresa, empresa.rnc, empresa.aprobada, empresa.eliminado, cierre.dia_ajustado AS dia_de_cierre, cierre.tipo_de_cierre, COUNT(empresausuario.id_empresa) AS cant_empleados
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
    })*/
});

 
app.post('/edit/(:id_empresa)', async (req, res) => {
    const id_empresa = req.params.id_empresa;
    const empresa = req.body.empresa;
    const cierre = req.body.cierre;
    console.log(id_empresa)
    console.log(cierre)
    console.log(empresa)
    let sql_query, sql_query2 = '';
 
    if (!empresa || !id_empresa) {
        res.status(400).send({error: true, message: 'Please provide an enterprise and enterprise id'});
    } else {
        try {
            const pool = await poolPromise
            const empresares = await pool.request()
                .input('aproved',sql.Bit, empresa.aprobada)
                .input('id_empresa',sql.NVarChar, id_empresa)
                .query(`UPDATE empresa SET aprobada = @aproved WHERE id_empresa = @id_empresa`)
            
            if (req.body.actualizar_cierre) {
                sql_query = `UPDATE cierre SET dia_de_cierre = CAST('@dia_de_cierre' AS DATE), dia_ajustado = dbo.ajustarDia(CONVERT(date,'2019-08-29',23)), tipo_de_cierre = @tipo_de_cierre WHERE id_cierre = (SELECT id_cierre FROM empresacierre WHERE id_empresa = @id_empresa)`;
                var cierreres = await pool.request()
                    .input('id_empresa', sql.NVarChar, id_empresa)
                    .input('dia_de_cierre', sql.NVarChar, cierre.dia_de_cierre)
                    .input('tipo_de_cierre', sql.NVarChar,cierre.tipo_de_cierre)
                    .query(sql_query)
            } else {
                sql_query = `INSERT INTO cierre VALUES ( CAST('@dia_de_cierre' AS DATE), ajustadorDia(dia_de_cierre), ); SELECT @@IDENTITY AS ID`;
                var cierreres = await pool.request()
                    .input('dia_de_cierre', sql.NVarChar, cierre.dia_de_cierre)
                    .input('tipo_de_cierre', sql.NVarChar,cierre.tipo_de_cierre)
                    .query(sql_query)
                console.log(cierreres.recordset)
                sql_query2 = `INSERT INTO empresacierre VALUES (@id_cierre, @id_empresa)`
                var empresacierreres = await pool.request()
                    .input('id_cierre', sql.NVarChar, cierreres.recordset[0].ID)
                    .input('id_empresa', sql.NVarChar, id_empresa)
                    .query(sql_query2)
            }
            
            res.status(200).send({error: false, result: empresares.recordset,message: "Item modificado exitosamente"});
        } catch (err) {
            console.log(err)
            res.status(500).send({error: true, message: err});
        }
        //Vainita MySQL
        /*req.getConnection((error, conn) => {
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
        });*/
    }
});

module.exports = app;