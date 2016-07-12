const passport = require('passport');
const express = require('express');

var router = express.Router();

router.get('/login', (req, res) => {
  if (req.user) {
    return res.redirect('/servers');
  }

  res.render('login', { message: req.flash('error') });
});

router.post('/login',
  passport.authenticate('local-login', {
    successRedirect: '/servers',
    failureRedirect: '/login',
    failureFlash: true
  })
);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

module.exports = router;
