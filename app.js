var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var client = require('./bin/redis')();
var mysql = require('./bin/sql')();
var ddos = require('ddos');
var SHA256 = require("crypto-js/sha256");
var random = require('random')
var passport = require('passport')
var session = require('express-session')
var RedisStore = require('connect-redis')(session)
var TokenGenerator = require('uuid-token-generator');
var tokgen = new TokenGenerator();
var LocalStrategy = require('passport-local').Strategy
var dos = new ddos({burst:10, limit:15})
var sqlinjection = require('sql-injection');

var connection = mysql;

connection.connect(function(err) {

  if (err) {
    console.error('[SQL]', 'Error connecting: ' + err.stack);
    return;
  }

  console.log('[SQL]', 'Connected as id ' + connection.threadId);

});

var app = express();

function authenticationMiddleware () {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/login')
  }
}

var indexRouter = require('./routes/index') (passport, authenticationMiddleware)
var studioRouter = require('./routes/studio') (passport, authenticationMiddleware)
var usersRouter = require('./routes/users') (passport, authenticationMiddleware)
var signupRouter = require('./routes/signup') (passport, authenticationMiddleware);
var loginRouter = require('./routes/login') (passport, authenticationMiddleware);
var logoutRouter = require('./routes/logout') (passport, authenticationMiddleware);
var restRouter = require('./routes/rest') (passport, authenticationMiddleware);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(sqlinjection);
app.use(dos.express);
app.use(express.json());

app.use(session({
  secret: 'hvYsBUtXNSdGdNnGriGqvGUshPMNcY8JlZKzLR8h8N1qMVqJruTIHXgq',
  resave: false,
  saveUninitialized: false,
  store: new RedisStore({
    host: 'localhost',
    port: 6397,
    client: client
  })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/studio', studioRouter);
app.use('/user', usersRouter);
app.use('/signup', signupRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/api', restRouter);

// setup passport.js
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// login strategy
passport.use('login', new LocalStrategy({passReqToCallback : true}, function(req, username, password, done) {

  connection.query(`SELECT * FROM passport.users WHERE username = '${username}' AND password = '${SHA256(password)}';`, function (error, results, fields) {
    if (error) {
      console.error(error)
      done(false, false, {message: 'SQL error'})
    } else {
      if (results.length) {

        return done(null, {
          id: results[0].id,
          username: results[0].username,
          name: results[0].name
        });

      } else {
        return done(false, false, {message: 'Username already exists.'});
      }
    }
  });

}));

// signup strategy
passport.use('signup', new LocalStrategy({passReqToCallback : true}, function(req, username, password, done) {
  connection.query(`SELECT * FROM passport.users WHERE username = '${username}';`, function (error, results, fields) {
    if (error) {
      console.error(error)
      done(false, false, {message: 'SQL error'})
    } else {
      if (results.length) {
        return done(false, false, { message: 'Username already exists.' });
      } else {

        let id = tokgen.generate();

        connection.query(`INSERT INTO passport.users VALUES ('${id}', '${username}', '${SHA256(password)}', '${Math.round(+new Date()/1000)}', '${req.params.name}', 'user', 'false');`, function (error, results, fields) {
          if (error) {
            console.error(error)
            done(false, false, {message: 'SQL error'})
          } else {
            return done(null, {
              id: id,
              username: username,
              name: req.param('name')
            });
          }
        });

      }
    }

  });
}));

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
