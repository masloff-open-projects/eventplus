var express = require('express');
var router = express.Router();
var feed = new (require('../provider/feed'))();
var fs = require('fs');
var signupBuilder = require('../builder/signup');
var loginBuilder = require('../builder/login');
var sessionsBuilder = require('../builder/sessions');
var createThoughtBuilder = require('../builder/createThought');
var getThoughtBuilder = require('../builder/getThoughts');
var xss = require("xss");

module.exports = function (passport, authenticationMiddleware, mysql) {

    /**
     * API for forms
     */

    // Login
    router.post('/v1/forms/auth/login', passport.authenticate('login'), function (req, res, next) {
        res.send({
            success: true,
            redirect: '/',
            fastRedirect: '/'
        });
    });

    // Register
    router.post('/v1/forms/auth/signup', passport.authenticate('signup'), function (req, res, next) {
        res.send({
            success: true,
            redirect: '/',
            fastRedirect: '/'
        });
    });

    // Logout
    router.get('/v1/forms/auth/logout', function (req, res){
        req.session.destroy(function (err) {
            res.redirect('/');
        });
    });


    /**
     * RestAPI
     */

    // Sign up
    router.post('/v1/auth/signup', function (req, res, next) {

        var signup = new signupBuilder();

        signup.use('mysql', mysql)

        signup.set('username', xss(req.body.username));
        signup.set('password', xss(req.body.password));
        signup.set('name', xss(req.body.name));

        signup.build();

        signup.run().then(event => {
            res.send(event)
        }).catch(event => {
            res.send(event)
        });

    });

    // Login
    router.post('/v1/auth/login', function (req, res, next) {

        var login = new loginBuilder();

        login.use('mysql', mysql)

        login.set('username', xss(req.body.username));
        login.set('password', xss(req.body.password));
        login.set('ip', xss(req.headers['x-forwarded-for'] || req.connection.remoteAddress));

        login.build();

        login.run().then(event => {
            res.send(event)
        }).catch(event => {
            res.send(event)
        });

    });

    // Sessions
    router.get('/v1/account/sessions', authenticationMiddleware(), function (req, res, next) {

        var sessions = new sessionsBuilder();

        sessions.use('mysql', mysql)

        sessions.set('id', xss(req.user.id));

        sessions.build();

        sessions.run().then(event => {
            res.send(event)
        }).catch(event => {
            res.send(event)
        });

    });

    // Create Thought
    router.post('/v1/account/thought', authenticationMiddleware(), function (req, res, next) {

        var thought = new createThoughtBuilder();

        thought.use('mysql', mysql)

        thought.set('id', xss(req.user.id));
        thought.set('thought', xss(req.body.thought));
        thought.set('title', xss(req.body.title));
        thought.set('public', xss(req.body.public));

        thought.build();

        thought.run().then(event => {
            res.send(event)
        }).catch(event => {
            res.send(event)
        });

    });

    // Get Thoughts
    router.get('/v1/account/thought', authenticationMiddleware(), function (req, res, next) {

        var thought = new getThoughtBuilder();

        thought.use('mysql', mysql)

        thought.set('id', xss(req.user.id));

        thought.build();

        thought.run().then(event => {
            res.send(event)
        }).catch(event => {
            res.send(event)
        });

    });

    // News
    router.get('/v1/feed/news', authenticationMiddleware(), function (req, res){
        feed.get().then(function (event) {
            res.send({
                success: true,
                feed: event
            });
        })
    });

    // Virtual program
    router.get('/v1/vm/:segment', authenticationMiddleware(), function (req, res){
        if (req.params.segment == 'all') {
            console.log(__dirname + '../virtual/all.js')
            res.send(fs.readFileSync(__dirname + '/../virtual/all.js', 'utf8'));
        }
    });

    return router;
}
