const express           = require('express');               //express server
const myConnection      = require('express-myconnection');  //consistent api for express eg. auto close db connection
const expressValidator  = require('express-validator');     //used for form validation
const bodyParser        = require('body-parser');           //read http POST data
const methodOverride    = require('method-override');       //use http verbs (POST, DELETE) where they are not supported
const mysql             = require('mysql');                 //MYSQL database API
const config            = require('./config');              //config values for server and database
const indexRoute        = require('./routes/index');
const itemRoute         = require('./routes/item');
let app = express();

let dbOptions = {
    host: config.database.host,
    user: config.database.username,
    password: config.database.password,
    database: config.database.name
}

app.set('view engine', 'ejs');
app.use(myConnection(mysql, dbOptions, 'pool'));
app.use(expressValidator());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride(function (req, res) {
    if ((req.body) && (typeof req.body === 'object') && ('_method' in req.body)) {
        let method = req.body._method;
        delete req.body._method;
        return method;
    }
}));
//routes
app.use('/', indexRoute);
app.use('/item', itemRoute);
//assets
app.use(express.static(__dirname + '/views/public'));

app.listen(config.server.port, function () {
    console.log(`Server running at ${config.server.host}:${config.server.port}`);
});