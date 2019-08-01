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
const empleadoRoute     = require('./routes/public/empleado');
const empresaRoute      = require('./routes/public/empresa');
const menuRoute         = require('./routes/public/menu');
const loginRoute        = require('./routes/public/login');
//api routes
const indexApi          = require('./routes/api/index');

// let loggedIn            = false;

let app = express();

app.set('view engine', 'ejs');
app.use(myConnection(mysql, config.values.database, 'pool'));
app.use(cors());
app.use(expressValidator());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressFlash());
app.use(cookieParser('molena'));
// app.use(bcrypt);
app.use(expressSession({ 
    secret: 'molena',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));
app.use(methodOverride((req, res) => {
    if ((req.body) && (typeof req.body === 'object') && ('_method' in req.body)) {
        let method = req.body._method;
        delete req.body._method;
        return method;
    }
}));
/*app.use(function requiresLogin(req, res, next) {
    if (req.session && req.session.userId) {
      return next();
    } else {
      var err = new Error('You must be logged in to view this page.');
      err.status = 401;
      return next(err);
    }
  });*/
//routes
console.log("logged in :",config.loggedIn);
app.use('/', indexRoute);
app.use('/item', itemRoute);
app.use('/empleado', empleadoRoute);
app.use('/menu', menuRoute);
app.use('/empresa', empresaRoute);
app.use('/login', loginRoute);
app.use('/api', indexApi);
app.use(express.static(__dirname + '/views/public'));
app.listen(process.env.PORT || config.values.server.port, function () {
    console.log(`Server running at ${config.values.server.url}`);
});