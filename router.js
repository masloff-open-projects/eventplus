"use strict";

import path from 'path';
import cookie from 'cookie-parser';
import express from 'express';
import favicon from 'serve-favicon';
import session from 'express-session';
import multer from 'multer';
import passportJS from 'passport';
import limit from 'express-rate-limit';

const app = express();

app.set('views', path.join(path.resolve(__dirname), '/views'));
app.set('view engine',  'twig');
app.set('view cache',  false);
app.set('cache', false);
app.set('twig options', { strict_variables: false });

app.use(session({
  secret:  'rM5qDil7mZNy8PfAKksW0IuGxwehOvgbSCLp3Y1oF4EXhp1ujcFxCILobHXJ3RO1',
  resave:  false,
  saveUninitialized:  false,
  // store: new rs ({
  //   host:  'localhost',
  //   port:  6379,
  //   client: module.exports.redis
  // })
}));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookie());
app.use(express.static(path.join(path.resolve(__dirname), '/public')));
app.use(favicon( path.join(path.resolve(__dirname), '/public/images/favicon.ico')));
app.use(multer().array());
app.use(passportJS.initialize());
app.use(passportJS.session());
app.use(limit({
  windowMs: 10 * 60 * 1000,
  max: 2500
}));

export const router = app;
export const passport = passportJS;