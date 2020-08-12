var express = require('express');
var router = express.Router();

module.exports = function (passport, authenticationMiddleware) {

    router.get('/', function (req, res){
        req.session.destroy(function (err) {
            res.redirect('/');
        });
    });

    return router;

}