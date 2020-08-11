var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var client = require('./bin/redis')();

var passport = require('passport')
var session = require('express-session')
var RedisStore = require('connect-redis')(session)

var LocalStrategy = require('passport-local').Strategy

var app = express();

// setup passport.js
app.use(session({
  store: new RedisStore(client),
  secret: 'hvYsBUtXNSdGdNnGriGqvGUshPMNcY8JlZKzLR8h8N1qMVqJruTIHXgq',
  resave: false,
  saveUninitialized: false
}))

const user = {
  username: 'test-user',
  password: 'my-password',
  id: 1
}

passport.use(new LocalStrategy(
    function(username, password, done) {
      findUser(username, function (err, user) {
        if (err) {
          return done(err)
        }
        if (!user) {
          return done(null, false)
        }
        if (password !== user.password ) {
          return done(null, false)
        }
        return done(null, user)
      })
    }
))

app.use(passport.initialize());
app.use(passport.session());

function authenticationMiddleware () {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/register')
  }
}

var indexRouter = require('./routes/index') (passport, authenticationMiddleware)
var usersRouter = require('./routes/users') (passport, authenticationMiddleware)
var registerRouter = require('./routes/register') (passport, authenticationMiddleware);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/register', registerRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
