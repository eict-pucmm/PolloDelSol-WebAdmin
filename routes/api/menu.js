const express = require('express');
let app = express();

app.get('/', (req, res) => {
    req.getConnection((error, conn) => {
        if (!error) {
            conn.query(`SELECT * FROM menu`, (err, rows, fields) => {
                if (!err) {
                    if (rows.length > 0) {
                        res.status(200).send({error: false, menus: rows});
                    } else {
                        res.status(204).send({error: false, message: 'Server request successful but data was not found'});
                    }
                } else {
                    res.status(500).send({error: true, message: err});
                }
            });
        } else {
            res.status(500).send({error: true, message: error});
        }
    });
});

module.exports = app;