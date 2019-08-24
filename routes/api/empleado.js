const express   = require('express');
const axios     = require('axios');
const config    = require('../../config');
const bcrypt    = require('bcrypt');
const {poolPromise} = require('../../db')
const sql = require('mssql')
// let logIn       = require('../../config').loggedIn.loggedIn;
let h;
let app = express();

app.get('/buscar', async (req, res, next) => {

    let sql_query = `SELECT * FROM empleado`;
    
    if (req.query.id_empleado) {
        sql_query += ` WHERE empleado.id_empleado = ${req.query.id_empleado}`;
    }
    if (req.query.correo) {
        sql_query += ` WHERE empleado.correo = '${req.query.correo}'`;
    }

    //Vainita SQL SERVER
    try {
        const pool = await poolPromise
        const empleadores = await pool.request()
            .query(sql_query)
        
        res.status(200).send({error: false, employee: empleadores.recordset});
    } catch (err) {
        console.log(err)
        res.status(500).send({error: true, message: err});
    }
    
});

app.get('/buscarContrasena', async (req,res,next) => {
    let sql_query = `SELECT * FROM credencial`;

    if(req.query.id_empleado) {
        sql_query += ` WHERE credencial.id_empleado = ${req.query.id_empleado}`
    }

    //Vainita SQL SERVER

    try {
        const pool = await poolPromise
        const credencialres = await pool.request()
            .query(sql_query)
        
        res.status(200).send({error: false, credencial: credencialres.recordset});
    } catch (err) {
        console.log(err)
        res.status(500).send({error: true, message: err});
    }
});

app.post('/registrar', async (req,res) => {

    const employee1 = req.body.data;
    const employee = {
        id_empleado: employee1.id_empleado,
        nombre:      employee1.nombre,
        correo:      employee1.correo,
        rol:         employee1.rol,
        eliminado:   employee1.eliminado,
        avatar:      employee1.avatar,
    }
    console.log(employee1)

    if(!employee){
        res.status(400).send({error: true, message: 'Please provide an employee'});
    } else {
        console.log("Employee data: ",employee)
        //Vainita SQL SERVER
        try {
            const pool = await poolPromise
            const empleadores = await pool.request()
                .input('nombre',sql.NVarChar, employee.nombre)
                .input('correo',sql.NVarChar, employee.correo)
                .input('rol', sql.NVarChar,employee.rol)
                .input('avatar', sql.NVarChar, employee.avatar)
                .input('verificado', sql.Bit, 0)
                .input('eliminado', sql.Bit, employee.eliminado)
                .query(`INSERT INTO EMPLEADO VALUES (@avatar, @nombre, @correo, @rol, @eliminado, @verificado); SELECT @@IDENTITY AS ID`)
            try {
                console.log("Lets hash")
                h = await bcrypt.hash(employee1.contrasena, 10);
            } catch (error) {
                console.log(error)
            }
            let credencial = {
                id_empleado: empleadores.recordset[0].ID,
                hash_password: h,
                fecha: new Date().toISOString().slice(0, 19).replace('T', ' ')
            }
            console.log(credencial);
            const credentialres = await pool.request()
                .input('id_empleado',sql.NVarChar, credencial.id_empleado)
                .input('hash', sql.Binary(60), new Buffer(credencial.hash_password))
                .input('fecha', sql.NVarChar, credencial.fecha)
                .query(`INSERT INTO CREDENCIAL VALUES (@id_empleado, @hash, CONVERT(DATE, @fecha, 21));`)
            
            res.status(200).send({error: false, result: empleadores.recordset,message: "Empleado registrado exitosamente"});
        } catch (err) {
            console.log(err)
            res.status(500).send({error: true, message: err});
        }
    }
});

app.post('/modificar/(:id_empleado)', async (req,res) => {

    const id_empleado = req.params.id_empleado;
    const empleado = req.body.data;

    if(!empleado || !id_empleado) {
        res.status(400).send({error: true, message: 'Please provide an employee and employee id'});
    } else {
        try {
            const pool = await poolPromise
            const updateempleadores = await pool.request()
                .input('nombre',sql.NVarChar, empleado.nombre)
                .input('correo',sql.NVarChar, empleado.correo)
                .input('rol', sql.NVarChar,empleado.rol)
                .input('avatar', sql.NVarChar, empleado.avatar)
                .input('eliminado', sql.Bit, empleado.eliminado)
                .query(`UPDATE EMPLEADO SET avatar = @avatar, nombre = @nombre, correo = @correo, rol = @rol, eliminado = @eliminado WHERE id_empleado = ${id_empleado}`)
            
            res.status(200).send({error: false, result: updateempleadores.recordset});
        } catch (err) {
            console.log(err)
            res.status(500).send({error: true, message: err});
        }
    }
});

app.post('/eliminar/(:id_empleado)', async (req, res, next) => {

    let employee;

    axios.get(`${config.values.server.url}/api/empleado/buscar?id_empleado=${req.params.id_empleado}`)
    .then(result => {
        employee = result.data.result[0];
    })
    .catch(err => {console.log(err)})
    .finally( async () => {
        try {
            const pool = await poolPromise
            if (employee.empleado === 0) {
                const credencialres = await pool.request()
                    .input("id_empleado",sql.Integer,employee.id_empleado)
                    .query(`UPDATE empleado SET eliminado = 1 WHERE id_empleado = @id_empleado`)
            
                res.status(200).send({error: false, credencial: credencialres.recordset});
            } else {
                const credencialres = await pool.request()
                    .input("id_empleado",sql.Integer,employee.id_empleado)
                    .query(`UPDATE empleado SET eliminado = 0 WHERE id_empleado = @id_empleado`)
            
                res.status(200).send({error: false, credencial: credencialres.recordset});
            }
        } catch (err) {
            console.log(err)
            res.status(500).send({error: true, message: err});
        }
    })
});

app.post('/login/(:emailuser)/(:contrasena)', async (req,res,next) => {
    
    let employee;

    await axios.get(`${config.values.server.url}/api/empleado/buscar?correo=${req.params.emailuser}`)
    .then(async function(result) {
        // console.log("supuesto undefined", result)
        if(result.status == 204) {
            res.status(204).send({error: false, message: 'Server request successful but data was not found'});        
        }else {
            employee = result.data.employee[0];
            await axios.get(`${config.values.server.url}/api/empleado/buscarContrasena?id_empleado=${employee.id_empleado}`)
            .then(result => {
                credencial = result.data.credencial[0];
                console.log(credencial.id_credencial , credencial.id_empleado);
            })

            let hashedPass = new Buffer.from(credencial.hash_password).toString('UTF-8');
            
            await bcrypt.compare(req.params.contrasena, hashedPass)
            .then((result,error) => {
                console.log("res result",result)
                if(result) {
                    if(employee.rol === 'Administrador'){
                        config.loggedIn = true;
                        config.employee = employee
                        res.status(200).send({error: false, result: result, message: `Usuario ${employee.nombre} ha iniciado sesion`});
                        
                    }
                }else {
                    console.log(error)
                    res.status(500).send({error: true, message: error})
                }
            })
        }
        
    })
    .catch(err => {console.log(err)});

    
});

module.exports = app;