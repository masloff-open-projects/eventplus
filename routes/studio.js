var express = require('express');
var router = express.Router();

module.exports = function (passport, authenticationMiddleware) {

    /* GET studio page. */
    router.get('/', authenticationMiddleware(), function(req, res, next) {
        res.render('studio', {
            brand: "Event+",
            show_brand: false,
            title: 'Studio Code',
            left_menu: [],
            right_menu: []
        });
    });

    return router;

}
