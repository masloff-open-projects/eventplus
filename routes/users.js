var express = require('express');
var router = express.Router();

module.exports = function (passport, authenticationMiddleware) {

  /* GET user page. */
  router.get('/', authenticationMiddleware(), function(req, res, next) {
    res.render('user', {
      user: req.user,
      brand: "Event+",
      show_brand: false,
      title: 'Me',
      left_menu: [
        {
          href: "/",
          text: "Main",
          active: false
        },
        {
          href: "/deals",
          text: "Deals History",
          active: false
        },
        {
          href: "javascript:window.open('/studio','Studio','resizable,height=600,width=800');",
          text: "VM Studio",
          active: false
        }
      ],
      right_menu: []
    });
  });

  return router;


}
