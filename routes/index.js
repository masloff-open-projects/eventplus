var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
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

module.exports = router;
