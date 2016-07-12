const express = require('express');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const flash = require('connect-flash');
const passport = require('passport');
const swagger = require('swagger-express');
const methodOverride = require('method-override');
const moment = require('moment');
const SequelizeStore = require('connect-session-sequelize')(expressSession.Store);

const models = require('./models');

const exposeCurrentUser = require('./middleware/expose-request');
const menu = require('./middleware/menu');
const baseUrl = require('./config').baseUrl;

require('./auth');

const PORT = process.env.PORT || 8080;

var app = express();

app.set('view engine', 'jade');
app.set('trust proxy');

app.locals.moment = moment;
app.locals.baseUrl = baseUrl;

app.use(cookieParser());
app.use(morgan('dev'));
app.use(flash());

app.use(expressSession({
  secret: 'somesecrettokenhere',
  saveUninitialized: false,
  resave: false,
  store: new SequelizeStore({
    db: models.sequelize,
    table: 'session'
  })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/js', express.static(__dirname + '/shared'));

app.use(methodOverride((req, res) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method;
    delete req.body._method;

    return method;
  }
}));

// Global middleware
app.use(exposeCurrentUser);
app.use(menu);

// Routes
app.get('/', (_, res) => res.redirect('/servers'));

app.use('/', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/servers', require('./routes/servers'));
app.use('/taxonomies', require('./routes/taxonomies'));
app.use('/databases', require('./routes/databases'));

app.use(swagger.init(app, {
  apiVersion: '1.0',
  swaggerVersion: '1.0',
  swaggerURL: '/swagger',
  swaggerJSON: '/api-docs.json',
  swaggerUI: './public/swagger/',
  basePath: baseUrl,
  info: {
    title: 'YACOM'
  },
  apis: ['routes/servers.js']
}));


var listener = app.listen(PORT, function() {
  var port = listener.address().port;
  app.set('port', port);
  console.log(`Listening on port ${port}`);
});

app.use((err, req, res, next) => {
  console.log(err);
  if (req.xhr) {
    if (err.name === 'SequelizeValidationError') {
      res.status(422).json({ type: 'validation', messages: err.errors.map(error => error.message) });
    } else {
      res.status(500).json({ type: 'unknown', message: 'Internal error' });
    }
  } else {
    next(err);
  }
});
