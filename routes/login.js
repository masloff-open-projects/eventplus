var express = require('express');
var router = express.Router();

module.exports = function (passport, authenticationMiddleware) {
    /* GET login page. */
    router.get('/', function (req, res, next) {
        res.render('login', {
            brand: 'Event+',
            show_brand: false,
            title: 'Login',
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
                    href: '/signup',
                    text: 'Sign Up',
                    active: false,
                },
            ],
        });
    });

    return router;
};
