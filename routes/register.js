var express = require('express');

module.exports = function (passport, authenticationMiddleware) {

    var router = express.Router();

    /* GET register page. */
    router.get('/', function(req, res, next) {
        res.render('register', {
            brand: "Event+",
            show_brand: false,
            title: 'Main',
            left_menu: [
                {
                    href: "/",
                    text: "Main",
                    active: true
                },
                {
                    href: "/deals",
                    text: "Deals History",
                    active: false
                }
            ],
            right_menu: [
                {
                    href: "/me",
                    text: "Me <i class=\"fas fa-user\"></i>",
                    active: false
                }
            ]
        });
    });

    router.get('/endpoint', function (req, res, next) {
        const user = {
            username: 'test-user',
            passwordHash: 'bcrypt-hashed-password',
            id: 1
        }


        passport.use(new LocalStrategy(
            (username, password, done) => {
                findUser(username, (err, user) => {
                    if (err) {
                        return done(err)
                    }

                    // User not found
                    if (!user) {
                        return done(null, false)
                    }

                    // Always use hashed passwords and fixed time comparison
                    bcrypt.compare(password, user.passwordHash, (err, isValid) => {
                        if (err) {
                            return done(err)
                        }
                        if (!isValid) {
                            return done(null, false)
                        }
                        return done(null, user)
                    })
                })
            }
        ))
    })

    return router;

}
