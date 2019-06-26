const express           = require('express');               //express server
const myConnection      = require('express-myconnection');  //consistent api for express eg. auto close db connection
const expressValidator  = require('express-validator');     //used for form validation
const bodyParser        = require('body-parser');           //read http POST data
const methodOverride    = require('method-override');       //use http verbs (POST, DELETE) where they are not supported
const mysql             = require('mysql');                 //MYSQL database API
const expressFlash      = require('express-flash')
const cookieParser      = require('cookie-parser');
const expressSession    = require('express-session');
const config            = require('./config');              //config values for server and database
const cors              = require('cors');
//visual routes
const indexRoute        = require('./routes/public/index');
const itemRoute         = require('./routes/public/item');
const empresaRoute      = require('./routes/public/empresa');
//api routes
const indexApi          = require('./routes/api/index');

let app = express();

app.set('view engine', 'ejs');
app.use(myConnection(mysql, config.database, 'pool'));
app.use(cors());
app.use(expressValidator());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressFlash())
app.use(cookieParser('molena'))
app.use(expressSession({ 
    secret: 'molena',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
app.use(methodOverride((req, res) => {
    if ((req.body) && (typeof req.body === 'object') && ('_method' in req.body)) {
        let method = req.body._method;
        delete req.body._method;
        return method;
    }
}));
//routes
app.use('/', indexRoute);
app.use('/item', itemRoute);
app.use('/empresa', empresaRoute);
app.use('/api', indexApi);
//assets
app.use(express.static(__dirname + '/views/public'));

app.listen(config.server.port, function () {
    console.log(`Server running at ${config.server.url}`);
});