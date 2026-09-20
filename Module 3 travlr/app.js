var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs');

var indexRouter = require('./app_server/routes/index');
var usersRouter = require('./app_server/routes/users');

var travelRouter = require('./app_server/routes/travel');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'hbs');
// Use the moved layout for each view and register shared page fragments.
app.locals.layout = 'layouts/layout';
hbs.registerPartials(path.join(__dirname, 'app_server', 'views', 'partials'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Legacy HTML URLs use the same JSON-driven Travel page.
app.get('/travel.html', (req, res) => res.redirect('/travel'));

// Keep assets and remaining HTML pages public; let the root route render Home.
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/travel', travelRouter);

// Catch 404 and forward to error handler.
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler.
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
