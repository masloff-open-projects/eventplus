var express = require('express');
var router = express.Router();
var sass = require('sass');

const cache = require("cache");
const c = new cache(0 * 60 * 1000);

module.exports = function (passport, authenticationMiddleware) {

    router.get('/:file', function (req, res, next) {

        if (c.get(`render-sass-${req.params.file}`)) {
            res.send(c.get(`render-sass-${req.params.file}`));
        } else {

            try {
                var css = sass.renderSync({file: `${__dirname}/../public/stylesheets/${req.params.file}.sass`});

                if (css) {
                    var data = css.css.toString();
                    c.put(`render-sass-${req.params.file}`, data);
                    res.send(data);
                } else {
                    res.send('');
                }
            } catch (e) {
                res.send(c.get(`render-sass-${req.params.file}`));
            }

        }

    });

    return router;

}
