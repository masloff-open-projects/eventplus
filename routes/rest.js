var express = require('express');
var router = express.Router();

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


    router.post ('/v1/auth/logout', function (req, res){
        req.session.destroy(function (err) {
            res.send({
                success: true,
                redirect: '/',
                fastRedirect: '/login',
            });
        });
    });

    return router;
}
