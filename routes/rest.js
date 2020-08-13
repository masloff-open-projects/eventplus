var express = require('express');
var router = express.Router();
var feed = new (require('../provider/feed'))();
var fs = require('fs');

module.exports = function (passport, authenticationMiddleware) {

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
