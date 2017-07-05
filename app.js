const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const searchDB = require('./searchDB');
const config = require('./config');

const FIVE_MINS_IN_MS = 5 * 60 * 1000;
const staticOpts = {
  index: false,
  maxAge: FIVE_MINS_IN_MS
};

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), staticOpts));
app.use('/vendor/normalize/normalize.css', express.static(path.join(__dirname, 'node_modules/normalize.css/normalize.css'), staticOpts));
app.use('/vendor/vue', express.static(path.join(__dirname, 'node_modules/vue/dist/'), staticOpts));

app.get('/', function(req, res, next) {
  const query = req.query.query;
  if (!query) return res.render('search', { config });
  searchDB(query)
    .then(results => res.render('search', { query, results, config }))
    .catch(error => next(new Error('Error querying database')));
});

app.get('/api/search', function(req, res) {
  searchDB(req.query.query, req.query.offset)
    .then(results => res.json({
      seqNum: req.query.seqNum,
      data: results
    }))
    .catch(err => {
    	res.json({
      	seqNum: req.query.seqNum,
    		data: [],
    		error: new Error('Error searching DB.')
    	});
    	console.error(err);
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function(err, req, res, next) {  // eslint-disable-line no-unused-vars
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

console.log(`App loaded successfully. Environment: ${process.env.NODE_ENV}`)
