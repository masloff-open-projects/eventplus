var express = require('express');
var router = express.Router();

module.exports = function (passport, authenticationMiddleware) {

  /* GET home page. */
  router.get('/', authenticationMiddleware(), function (req, res, next) {
    res.render('index', {
      user: req.user,
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

      ]
    });
  });

  return router;

}