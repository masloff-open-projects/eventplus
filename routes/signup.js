var express = require('express');
var router = express.Router();

module.exports = function (passport, authenticationMiddleware) {
    /* GET register page. */
    router.get('/', function (req, res, next) {
        res.render('signup', {
            brand: 'Event+',
            show_brand: false,
            title: 'Signup',
            left_menu: [
                {
                    href: '/',
                    text: 'Main',
                    active: true,
                },
                {
                    href: '/wiki',
                    text: 'Wiki',
                    active: false,
                },
            ],
            right_menu: [
                {
                    href: '/login',
                    text: 'Login',
                    active: false,
                },
            ],
        });
    });

    return router;
};
