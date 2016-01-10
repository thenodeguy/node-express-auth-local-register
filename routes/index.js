'use strict';

var passport = require('passport');
var router = require('express').Router();

// Set the 'isLoggedIn' variable is used on the web templates.
router.use(function(req, res, next) {
  res.locals.isLoggedIn = req.isAuthenticated();
  next();
});

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', suppressLoggedInUsers, function(req, res, next) {
  res.render('login', { message: req.flash('error') });
});

router.post('/login',
  suppressLoggedInUsers,
  passport.authenticate('local', {failureRedirect:'/login', failureFlash: true}),
  function(req, res, next) {
    res.redirect('/dashboard');
});

router.get('/dashboard', forceLogIn, function(req, res, next) {
  res.render('dashboard');
});

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

function suppressLoggedInUsers(req, res, next) {
  if(req.user) {
    //User is logged in. Clear any flash messages and then redirect.
    req.flash('error', null);
    res.redirect('/dashboard');
    return;
  }
  //User is not logged in. Proceed.
  next();
}

function forceLogIn(req, res, next) {
  if(req.user) {
    //User is logged in.
    next();
  }
  else {
    //User is not logged in
    res.redirect('/login');
  }
}

module.exports = router;
