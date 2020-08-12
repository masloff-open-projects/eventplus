var express = require('express');
var router = express.Router();

module.exports = function (passport, authenticationMiddleware) {

  /* GET users listing. */
  router.get('/', authenticationMiddleware(), function(req, res, next) {
    res.send({success: req.user});
  });

  return router;

}
